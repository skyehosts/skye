import { Injectable, Logger } from '@nestjs/common';
import { Booking } from '../../booking/entities';
import { DatabaseService } from '../../common/providers';
import { Listing } from '../../listing/entities';
import { Message } from '../../message/entities';
import { MessageGateway } from '../../message/gateways';
import { MessageService } from '../../message/providers';
import { NotificationService } from '../../notification/providers';
import { MessageLog, ScheduledMessage, SentMessage } from '../entities';

@Injectable()
export class ScheduledMessageDeliveryService {
  private readonly logger = new Logger(ScheduledMessageDeliveryService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly messageGateway: MessageGateway,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
  ) {}

  async deliver(scheduledMessageId: number): Promise<void> {
    const scheduledMessage = await this.databaseService
      .getRepository(ScheduledMessage)
      .findOne({
        where: { id: scheduledMessageId },
        relations: ['templateVersion'],
      });

    if (!scheduledMessage) {
      this.logger.warn(
        `Scheduled message #${scheduledMessageId} not found, skipping`,
      );
      return;
    }

    if (scheduledMessage.status !== 'processing') {
      this.logger.warn(
        `Scheduled message #${scheduledMessageId} has status '${scheduledMessage.status}', skipping`,
      );
      return;
    }

    // Guard against duplicate delivery
    const alreadySent = await this.databaseService
      .getRepository(SentMessage)
      .findOne({ where: { scheduledMessageId } });

    if (alreadySent) {
      scheduledMessage.status = 'sent';
      scheduledMessage.updatedAt = new Date();
      await this.databaseService
        .getRepository(ScheduledMessage)
        .save(scheduledMessage);
      return;
    }

    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where: { id: scheduledMessage.listingId } });

    const now = new Date();
    const content = scheduledMessage.templateVersion.content;

    const queryRunner = await this.databaseService.startTransaction();
    let savedMessage: Message;

    try {
      const manager = queryRunner.manager;

      savedMessage = await manager.getRepository(Message).save({
        bookingId: scheduledMessage.bookingId,
        senderId: listing.hostId,
        content,
        readAt: null,
        createdAt: now,
      } as Message);

      await manager.getRepository(SentMessage).save({
        scheduledMessageId,
        renderedContent: content,
        deliveryMetadata: null,
        sentAt: now,
      } as SentMessage);

      scheduledMessage.status = 'sent';
      scheduledMessage.updatedAt = now;
      await manager.getRepository(ScheduledMessage).save(scheduledMessage);

      await manager.getRepository(MessageLog).save({
        scheduledMessageId,
        action: 'sent',
        details: null,
        createdAt: now,
      } as MessageLog);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    this.logger.debug(
      `Scheduled message #${scheduledMessageId} delivered to booking #${scheduledMessage.bookingId}`,
    );

    // Broadcast via WebSocket after transaction commits
    const senderName = await this.messageService.getSenderName(listing.hostId);

    this.messageGateway.emitNewMessage(scheduledMessage.bookingId, {
      id: savedMessage.id,
      bookingId: scheduledMessage.bookingId,
      senderId: listing.hostId,
      senderName,
      content,
      createdAt: now,
    });

    // Send push notification after transaction commits (fire-and-forget)
    const booking = await this.databaseService
      .getRepository(Booking)
      .findOne({ where: { id: scheduledMessage.bookingId } });

    if (booking) {
      await this.notificationService.send({
        recipientAccountId: booking.guestId,
        eventType: 'message_received',
        title: 'New message from your host',
        body: content.length > 100 ? content.slice(0, 100) + '...' : content,
        data: { bookingId: booking.id, url: `/conversation/${booking.id}` },
      });
    }
  }
}
