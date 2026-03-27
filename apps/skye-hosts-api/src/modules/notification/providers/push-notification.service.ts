import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationEventType } from '@repo/skye-hosts-api-client';
import * as Sentry from '@sentry/nestjs';
import { Repository } from 'typeorm';
import {
  DeviceToken,
  NotificationHistory,
  NotificationPreference,
} from '../entities';
import {
  ExpoPushClient,
  type ExpoPushMessage,
  type ExpoPushTicket,
} from './expo-push.client';

interface SendPushParams {
  recipientAccountId: number;
  eventType: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly maxRetries = 3;

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(NotificationHistory)
    private readonly historyRepo: Repository<NotificationHistory>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    private readonly expoPushClient: ExpoPushClient,
  ) {}

  async send(params: SendPushParams): Promise<void> {
    try {
      await this.sendInternal(params);
    } catch (error) {
      this.logger.error(
        `Unexpected error sending push for event ${params.eventType} to account ${params.recipientAccountId}`,
        error instanceof Error ? error.stack : error,
      );
      Sentry.captureException(error);
    }
  }

  private async sendInternal(params: SendPushParams): Promise<void> {
    const { recipientAccountId, eventType, title, body, data } = params;

    const pushEnabled = await this.isPushEnabled(recipientAccountId, eventType);
    if (!pushEnabled) {
      this.logger.debug(
        `Push disabled for ${eventType} on account ${recipientAccountId}, skipping`,
      );
      return;
    }

    const deviceTokens = await this.deviceTokenRepo.find({
      where: { accountId: recipientAccountId },
    });

    if (deviceTokens.length === 0) {
      this.logger.debug(
        `No device tokens for account ${recipientAccountId}, skipping push`,
      );
      return;
    }

    const messages: ExpoPushMessage[] = deviceTokens.map((dt) => ({
      to: dt.token,
      title,
      body,
      data,
      sound: 'default' as const,
    }));

    let tickets: ExpoPushTicket[] = [];
    let lastError: Error | null = null;
    let attempts = 0;

    for (let i = 0; i < this.maxRetries; i++) {
      attempts = i + 1;
      try {
        tickets = await this.expoPushClient.sendPushNotifications(messages);
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Push attempt ${attempts}/${this.maxRetries} failed for account ${recipientAccountId}: ${lastError.message}`,
        );
        if (i < this.maxRetries - 1) {
          await this.sleep(500 * Math.pow(2, i));
        }
      }
    }

    if (lastError) {
      await this.logHistory({
        accountId: recipientAccountId,
        eventType,
        title,
        body,
        status: 'failed',
        expoTicketId: null,
        expoResponse: null,
        errorMessage: lastError.message,
        attemptCount: attempts,
      });
      return;
    }

    await this.processTickets(
      tickets,
      deviceTokens,
      recipientAccountId,
      eventType,
      title,
      body,
      attempts,
    );
  }

  private async processTickets(
    tickets: ExpoPushTicket[],
    deviceTokens: DeviceToken[],
    accountId: number,
    eventType: NotificationEventType,
    title: string,
    body: string,
    attemptCount: number,
  ): Promise<void> {
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const deviceToken = deviceTokens[i];

      if (
        ticket.status === 'error' &&
        ticket.details?.error === 'DeviceNotRegistered'
      ) {
        this.logger.debug(
          `Removing invalid token for account ${accountId}: ${deviceToken.token.slice(0, 20)}...`,
        );
        await this.deviceTokenRepo.remove(deviceToken);
      }

      await this.logHistory({
        accountId,
        eventType,
        title,
        body,
        status: ticket.status === 'ok' ? 'sent' : 'failed',
        expoTicketId: ticket.id || null,
        expoResponse: ticket as unknown as Record<string, unknown>,
        errorMessage: ticket.message || null,
        attemptCount,
      });
    }
  }

  private async isPushEnabled(
    accountId: number,
    eventType: NotificationEventType,
  ): Promise<boolean> {
    const preference = await this.preferenceRepo.findOne({
      where: { accountId, eventType },
    });
    return preference?.pushEnabled ?? true;
  }

  private async logHistory(params: {
    accountId: number;
    eventType: NotificationEventType;
    title: string;
    body: string;
    status: 'sent' | 'failed';
    expoTicketId: string | null;
    expoResponse: Record<string, unknown> | null;
    errorMessage: string | null;
    attemptCount: number;
  }): Promise<void> {
    try {
      await this.historyRepo.save(params as NotificationHistory);
    } catch (error) {
      this.logger.error('Failed to log notification history', error);
      Sentry.captureException(error);
    }
  }

  async registerDeviceToken(
    accountId: number,
    token: string,
    platform: 'ios' | 'android',
  ): Promise<void> {
    const existing = await this.deviceTokenRepo.findOne({ where: { token } });

    if (existing) {
      if (existing.accountId !== accountId) {
        existing.accountId = accountId;
        existing.platform = platform;
        await this.deviceTokenRepo.save(existing);
      }
      return;
    }

    await this.deviceTokenRepo.save(
      this.deviceTokenRepo.create({ accountId, token, platform }),
    );
  }

  async removeDeviceToken(token: string): Promise<void> {
    await this.deviceTokenRepo.delete({ token });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
