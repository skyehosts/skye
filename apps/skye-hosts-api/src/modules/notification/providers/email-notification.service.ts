import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationEventType } from '@repo/skye-hosts-api-client';
import * as Sentry from '@sentry/nestjs';
import { Repository } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { EmailTemplate } from '../../email/enums/email-template.enum';
import { ResendService } from '../../email/providers/resend.service';
import { NotificationPreference } from '../entities';

interface SendEmailParams {
  recipientAccountId: number;
  eventType: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const EVENT_TYPE_TO_TEMPLATE: Record<NotificationEventType, EmailTemplate> = {
  booking_requested: EmailTemplate.BookingRequested,
  booking_confirmed: EmailTemplate.BookingConfirmed,
  booking_cancelled: EmailTemplate.BookingCancelled,
  message_received: EmailTemplate.MessageReceived,
};

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly resendService: ResendService,
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

      const account = await this.accountRepo.findOne({
        where: { id: params.recipientAccountId },
      });

      if (!account?.email) {
        this.logger.debug(
          `No email address for account ${params.recipientAccountId}, skipping`,
        );
        return;
      }

      const template = EVENT_TYPE_TO_TEMPLATE[params.eventType];
      const variables = this.buildVariables(account.name, params);

      await this.resendService.sendTemplate(account.email, template, variables);
    } catch (error) {
      this.logger.error(
        `Failed to send email for ${params.eventType} to account ${params.recipientAccountId}`,
        error instanceof Error ? error.stack : error,
      );
      Sentry.captureException(error);
    }
  }

  private buildVariables(
    recipientName: string,
    params: SendEmailParams,
  ): Record<string, string> {
    const variables: Record<string, string> = {
      recipientName,
      title: params.title,
      body: params.body,
    };

    if (params.data) {
      for (const [key, value] of Object.entries(params.data)) {
        if (value != null) {
          variables[key] = String(value);
        }
      }
    }

    return variables;
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
