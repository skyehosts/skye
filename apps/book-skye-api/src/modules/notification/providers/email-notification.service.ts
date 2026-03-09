import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationEventType } from '@repo/skye-hosts-api-client';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../entities';

interface SendEmailParams {
  recipientAccountId: number;
  eventType: NotificationEventType;
  title: string;
  body: string;
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
  ) {}

  async send(params: SendEmailParams): Promise<void> {
    try {
      const emailEnabled = await this.isEmailEnabled(
        params.recipientAccountId,
        params.eventType,
      );

      if (!emailEnabled) {
        this.logger.debug(
          `Email disabled for ${params.eventType} on account ${params.recipientAccountId}, skipping`,
        );
        return;
      }

      // TODO: implement email sending (SMTP / SES / etc.)
      this.logger.debug(
        `Email would be sent to account ${params.recipientAccountId}: "${params.title}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email for ${params.eventType} to account ${params.recipientAccountId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async isEmailEnabled(
    accountId: number,
    eventType: NotificationEventType,
  ): Promise<boolean> {
    const preference = await this.preferenceRepo.findOne({
      where: { accountId, eventType },
    });
    return preference?.emailEnabled ?? true;
  }
}
