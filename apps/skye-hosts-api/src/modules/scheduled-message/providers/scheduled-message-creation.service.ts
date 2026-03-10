import { Injectable, Logger } from '@nestjs/common';
import type { OffsetUnit, TriggerType } from '@repo/skye-hosts-api-client';
import { createHash } from 'crypto';
import { Booking } from '../../booking/entities';
import { DatabaseService } from '../../common/providers';
import { Listing } from '../../listing/entities';
import {
  ListingMessageTemplate,
  MessageLog,
  ScheduledMessage,
  TemplateTrigger,
  TemplateVersion,
} from '../entities';

/** Staggered sendAt offsets for test bookings (minutes from now) */
const TEST_TRIGGER_OFFSETS: Record<TriggerType, number> = {
  booking_confirmed: 0,
  before_check_in: 1,
  before_checkout: 2,
  after_checkout: 3,
};

@Injectable()
export class ScheduledMessageCreationService {
  private readonly logger = new Logger(ScheduledMessageCreationService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async createForBooking(
    booking: Booking,
    listing: Listing,
    isTestBooking?: boolean,
  ): Promise<void> {
    const attachments = await this.databaseService
      .getRepository(ListingMessageTemplate)
      .find({ where: { listingId: listing.id } });

    if (attachments.length === 0) return;

    for (const attachment of attachments) {
      const [activeVersion, triggers] = await Promise.all([
        this.databaseService.getRepository(TemplateVersion).findOne({
          where: {
            messageTemplateId: attachment.messageTemplateId,
            status: 'active',
          },
          order: { versionNumber: 'DESC' },
        }),
        this.databaseService
          .getRepository(TemplateTrigger)
          .find({ where: { messageTemplateId: attachment.messageTemplateId } }),
      ]);

      if (!activeVersion || triggers.length === 0) continue;

      for (const trigger of triggers) {
        await this.createScheduledMessageForTrigger(
          booking,
          trigger,
          activeVersion,
          isTestBooking,
        );
      }
    }
  }

  private async createScheduledMessageForTrigger(
    booking: Booking,
    trigger: TemplateTrigger,
    activeVersion: TemplateVersion,
    isTestBooking?: boolean,
  ): Promise<void> {
    if (!trigger.allowMultiplePerBooking) {
      const existing = await this.databaseService
        .getRepository(ScheduledMessage)
        .findOne({
          where: { bookingId: booking.id, templateTriggerId: trigger.id },
        });
      if (existing) {
        this.logger.debug(
          `Skipping trigger #${trigger.id} for booking #${booking.id}: allowMultiplePerBooking = false`,
        );
        return;
      }
    }

    const sendAt = isTestBooking
      ? this.computeTestSendAt(trigger)
      : this.computeSendAt(trigger, booking);

    if (sendAt === null) {
      this.logger.debug(
        `Skipping trigger #${trigger.id} for booking #${booking.id}: sendAt is in the past and sendIfPast = false`,
      );
      return;
    }

    const idempotencyKey = createHash('sha256')
      .update(`${booking.id}:${trigger.id}:${activeVersion.id}`)
      .digest('hex');

    const duplicate = await this.databaseService
      .getRepository(ScheduledMessage)
      .findOne({ where: { idempotencyKey } });

    if (duplicate) {
      this.logger.debug(
        `Skipping duplicate scheduled message for booking #${booking.id}, trigger #${trigger.id}`,
      );
      return;
    }

    const now = new Date();

    const scheduledMessage = await this.databaseService
      .getRepository(ScheduledMessage)
      .save({
        bookingId: booking.id,
        listingId: booking.listingId,
        templateVersionId: activeVersion.id,
        templateTriggerId: trigger.id,
        sendAt,
        status: 'pending',
        idempotencyKey,
        retryCount: 0,
        lockedAt: null,
        lockedBy: null,
        createdAt: now,
        updatedAt: now,
      } as ScheduledMessage);

    await this.databaseService.getRepository(MessageLog).save({
      scheduledMessageId: scheduledMessage.id,
      action: 'created',
      details: null,
      createdAt: now,
    } as MessageLog);

    this.logger.debug(
      `Scheduled message #${scheduledMessage.id} created for booking #${booking.id}, ` +
        `trigger=${trigger.triggerType}, sendAt: ${sendAt.toISOString()}` +
        (isTestBooking ? ' (TEST)' : ''),
    );
  }

  private computeTestSendAt(trigger: TemplateTrigger): Date {
    const offsetMinutes =
      TEST_TRIGGER_OFFSETS[trigger.triggerType as TriggerType] ?? 0;
    return new Date(Date.now() + offsetMinutes * 60 * 1000);
  }

  private computeSendAt(
    trigger: TemplateTrigger,
    booking: Booking,
  ): Date | null {
    const offsetMs = this.toMs(trigger.offsetValue, trigger.offsetUnit);
    const now = new Date();
    let sendAt: Date;

    switch (trigger.triggerType as TriggerType) {
      case 'booking_confirmed':
        sendAt = new Date(now.getTime() + offsetMs);
        break;
      case 'before_check_in':
        sendAt = new Date(booking.checkInAt.getTime() - offsetMs);
        break;
      case 'before_checkout':
        sendAt = new Date(booking.checkOutAt.getTime() - offsetMs);
        break;
      case 'after_checkout':
        sendAt = new Date(booking.checkOutAt.getTime() + offsetMs);
        break;
      default:
        return null;
    }

    if (sendAt < now) {
      return trigger.sendIfPast ? now : null;
    }

    return sendAt;
  }

  private toMs(value: number, unit: OffsetUnit): number {
    return unit === 'hours'
      ? value * 60 * 60 * 1000
      : value * 24 * 60 * 60 * 1000;
  }
}
