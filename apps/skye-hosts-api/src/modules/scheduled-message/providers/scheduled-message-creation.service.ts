import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { OffsetUnit, TriggerType } from '@repo/skye-hosts-api-client';
import { createHash } from 'crypto';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { Booking } from '../../booking/entities';
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

  constructor(
    @InjectRepository(ListingMessageTemplate)
    private readonly listingMessageTemplateRepo: Repository<ListingMessageTemplate>,
    @InjectRepository(TemplateVersion)
    private readonly templateVersionRepo: Repository<TemplateVersion>,
    @InjectRepository(TemplateTrigger)
    private readonly templateTriggerRepo: Repository<TemplateTrigger>,
    @InjectRepository(ScheduledMessage)
    private readonly scheduledMessageRepo: Repository<ScheduledMessage>,
    @InjectRepository(MessageLog)
    private readonly messageLogRepo: Repository<MessageLog>,
  ) {}

  async createForBooking(
    booking: Booking,
    listing: Listing,
    isTestBooking?: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = <T>(entity: EntityTarget<T>) =>
      manager ? manager.getRepository(entity) : this.getDefaultRepo(entity);

    const attachments = await repo(ListingMessageTemplate).find({
      where: { listingId: listing.id },
    });

    if (attachments.length === 0) return;

    for (const attachment of attachments) {
      const [activeVersion, triggers] = await Promise.all([
        repo(TemplateVersion).findOne({
          where: {
            messageTemplateId: attachment.messageTemplateId,
            status: 'active',
          },
          order: { versionNumber: 'DESC' },
        }),
        repo(TemplateTrigger).find({
          where: { messageTemplateId: attachment.messageTemplateId },
        }),
      ]);

      if (!activeVersion || triggers.length === 0) continue;

      for (const trigger of triggers) {
        await this.createScheduledMessageForTrigger(
          booking,
          trigger,
          activeVersion,
          isTestBooking,
          manager,
        );
      }
    }
  }

  private getDefaultRepo<T>(entity: EntityTarget<T>): Repository<T> {
    if (entity === ListingMessageTemplate)
      return this.listingMessageTemplateRepo as unknown as Repository<T>;
    if (entity === TemplateVersion)
      return this.templateVersionRepo as unknown as Repository<T>;
    if (entity === TemplateTrigger)
      return this.templateTriggerRepo as unknown as Repository<T>;
    if (entity === ScheduledMessage)
      return this.scheduledMessageRepo as unknown as Repository<T>;
    if (entity === MessageLog)
      return this.messageLogRepo as unknown as Repository<T>;
    throw new Error(`No default repository for entity: ${String(entity)}`);
  }

  private async createScheduledMessageForTrigger(
    booking: Booking,
    trigger: TemplateTrigger,
    activeVersion: TemplateVersion,
    isTestBooking?: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = <T>(entity: EntityTarget<T>) =>
      manager ? manager.getRepository(entity) : this.getDefaultRepo(entity);

    if (!trigger.allowMultiplePerBooking) {
      const existing = await repo(ScheduledMessage).findOne({
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

    const duplicate = await repo(ScheduledMessage).findOne({
      where: { idempotencyKey },
    });

    if (duplicate) {
      this.logger.debug(
        `Skipping duplicate scheduled message for booking #${booking.id}, trigger #${trigger.id}`,
      );
      return;
    }

    const now = new Date();

    const scheduledMessage = await repo(ScheduledMessage).save({
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

    await repo(MessageLog).save({
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
        sendAt = new Date(new Date(booking.checkInDate).getTime() - offsetMs);
        break;
      case 'before_checkout':
        sendAt = new Date(new Date(booking.checkOutDate).getTime() - offsetMs);
        break;
      case 'after_checkout':
        sendAt = new Date(new Date(booking.checkOutDate).getTime() + offsetMs);
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
