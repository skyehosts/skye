import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { Listing } from '../../listing/entities';
import { Message } from '../../message/entities';
import { MessageGateway } from '../../message/gateways';
import { MessageService } from '../../message/providers';
import { NotificationService } from '../../notification/providers';
import { MessageLog, ScheduledMessage, SentMessage } from '../entities';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class ScheduledMessageDeliveryService {
  private readonly logger = new Logger(ScheduledMessageDeliveryService.name);

  constructor(
    @InjectRepository(ScheduledMessage)
    private readonly scheduledMessageRepo: Repository<ScheduledMessage>,
    @InjectRepository(SentMessage)
    private readonly sentMessageRepo: Repository<SentMessage>,
    @InjectRepository(MessageLog)
    private readonly messageLogRepo: Repository<MessageLog>,
    // Booking registered locally — circular dep: ScheduledMessageModule → BookingModule → ScheduledMessageModule
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly messageGateway: MessageGateway,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
    private readonly templateInterpolationService: TemplateInterpolationService,
  ) {}

  async deliver(scheduledMessageId: number): Promise<void> {
    const scheduledMessage = await this.scheduledMessageRepo.findOne({
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
    const alreadySent = await this.sentMessageRepo.findOne({
      where: { scheduledMessageId },
    });

    if (alreadySent) {
      scheduledMessage.status = 'sent';
      scheduledMessage.updatedAt = new Date();
      await this.scheduledMessageRepo.save(scheduledMessage);
      return;
    }

    const [listing, booking] = await Promise.all([
      this.listingRepo.findOne({
        where: { id: scheduledMessage.listingId },
      }),
      this.bookingRepo.findOne({
        where: { id: scheduledMessage.bookingId },
        relations: ['guest'],
      }),
    ]);

    const host = listing
      ? await this.accountRepo.findOne({
          where: { id: listing.hostId },
        })
      : null;

    const now = new Date();
    const rawContent = scheduledMessage.templateVersion.content;
    const content =
      listing && booking?.guest && host
        ? this.templateInterpolationService.interpolate(rawContent, {
            booking,
            guest: booking.guest,
            listing,
            host,
          })
        : rawContent;

    const savedMessage = await this.dataSource.transaction(async (manager) => {
      const message = await manager.getRepository(Message).save({
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

      return message;
    });

    this.logger.debug(
      `Scheduled message #${scheduledMessageId} delivered to booking #${scheduledMessage.bookingId}`,
    );

    // Send push notification and broadcast via WebSocket after transaction commits
    const senderName = await this.messageService.getSenderName(listing.hostId);

    this.messageGateway.emitNewMessage(
      scheduledMessage.bookingId,
      {
        id: savedMessage.id,
        bookingId: scheduledMessage.bookingId,
        senderId: listing.hostId,
        senderName,
        content,
        createdAt: now,
      },
      booking
        ? { senderId: listing.hostId, recipientId: booking.guestId }
        : undefined,
    );

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
