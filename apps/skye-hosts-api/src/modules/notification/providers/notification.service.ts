import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  IGetNotificationPreferencesResponseDto,
  IUpdateNotificationPreferenceResponseDto,
  NotificationEventType,
} from '@repo/skye-hosts-api-client';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../entities';
import { EmailNotificationService } from './email-notification.service';
import { PushNotificationService } from './push-notification.service';

export interface SendNotificationParams {
  recipientAccountId: number;
  eventType: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const ALL_EVENT_TYPES: NotificationEventType[] = [
  'booking_requested',
  'booking_confirmed',
  'booking_cancelled',
  'message_received',
];

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private readonly repo: Repository<NotificationPreference>,
    private readonly pushNotificationService: PushNotificationService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async send(params: SendNotificationParams): Promise<void> {
    await Promise.all([
      this.pushNotificationService.send(params),
      this.emailNotificationService.send(params),
    ]);
  }

  async getPreferences(
    accountId: number,
  ): Promise<IGetNotificationPreferencesResponseDto> {
    const existing = await this.repo.find({ where: { accountId } });

    const preferences = ALL_EVENT_TYPES.map((eventType) => {
      const pref = existing.find((p) => p.eventType === eventType);
      return {
        eventType,
        pushEnabled: pref?.pushEnabled ?? true,
        emailEnabled: pref?.emailEnabled ?? true,
      };
    });

    return { preferences };
  }

  async updatePreference(
    accountId: number,
    eventType: NotificationEventType,
    pushEnabled: boolean,
    emailEnabled: boolean,
  ): Promise<IUpdateNotificationPreferenceResponseDto> {
    let pref = await this.repo.findOne({
      where: { accountId, eventType },
    });

    if (pref) {
      pref.pushEnabled = pushEnabled;
      pref.emailEnabled = emailEnabled;
    } else {
      pref = this.repo.create({
        accountId,
        eventType,
        pushEnabled,
        emailEnabled,
      });
    }

    await this.repo.save(pref);
    this.logger.debug(
      `Updated ${eventType} for account ${accountId}: push=${pushEnabled}, email=${emailEnabled}`,
    );

    return {
      preference: {
        eventType: pref.eventType,
        pushEnabled: pref.pushEnabled,
        emailEnabled: pref.emailEnabled,
      },
    };
  }
}
