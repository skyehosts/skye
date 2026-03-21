import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import type {
  GetConversationsResponseDto,
  GetMessagesResponseDto,
  MarkMessagesReadResponseDto,
  SendMessageResponseDto,
} from '../dto';
import { Message } from '../entities';

interface BookingAccessResult {
  booking: Booking;
  isGuest: boolean;
  isHost: boolean;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    // Booking registered locally — circular dep: MessageModule → BookingModule → ScheduledMessageModule → MessageModule
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async validateBookingAccess(
    bookingId: number,
    userId: number,
  ): Promise<BookingAccessResult> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['listing'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isGuest = booking.guestId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isGuest && !isHost) {
      throw new ForbiddenException(
        'You do not have access to this booking conversation',
      );
    }

    return { booking, isGuest, isHost };
  }

  async sendMessage(
    bookingId: number,
    senderId: number,
    content: string,
  ): Promise<SendMessageResponseDto> {
    await this.validateBookingAccess(bookingId, senderId);

    const now = new Date();
    const message = await this.messageRepo.save({
      bookingId,
      senderId,
      content,
      readAt: null,
      createdAt: now,
    } as Message);

    return {
      id: message.id,
      bookingId: message.bookingId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  async getMessages(
    bookingId: number,
    userId: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<GetMessagesResponseDto> {
    await this.validateBookingAccess(bookingId, userId);

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { bookingId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        bookingId: msg.bookingId,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        content: msg.content,
        readAt: msg.readAt,
        createdAt: msg.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async markAsRead(
    bookingId: number,
    userId: number,
  ): Promise<MarkMessagesReadResponseDto> {
    await this.validateBookingAccess(bookingId, userId);

    const result = await this.messageRepo.update(
      { bookingId, senderId: Not(userId), readAt: IsNull() },
      { readAt: new Date() },
    );

    return {
      updatedCount: result.affected || 0,
    };
  }

  async getConversations(userId: number): Promise<GetConversationsResponseDto> {
    const account = await this.accountRepo.findOne({
      where: { id: userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const bookingsAsGuest = await this.bookingRepo.find({
      where: { guestId: userId },
      relations: ['listing'],
    });

    const bookingsAsHost = await this.bookingRepo
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.listing', 'listing')
      .where('listing.hostId = :userId', { userId })
      .getMany();

    const allBookings = [...bookingsAsGuest, ...bookingsAsHost];
    const uniqueBookings = allBookings.filter(
      (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i,
    );

    const conversations = await Promise.all(
      uniqueBookings.map(async (booking) => {
        const lastMessage = await this.messageRepo.findOne({
          where: { bookingId: booking.id },
          order: { createdAt: 'DESC' },
        });

        if (!lastMessage) {
          return null;
        }

        const unreadCount = await this.messageRepo.count({
          where: {
            bookingId: booking.id,
            senderId: Not(userId),
            readAt: IsNull(),
          },
        });

        const isGuest = booking.guestId === userId;
        let otherPartyName: string;

        if (isGuest) {
          const host = await this.accountRepo.findOne({
            where: { id: booking.listing.hostId },
          });
          otherPartyName = host?.name || 'Unknown';
        } else {
          const guest = await this.accountRepo.findOne({
            where: { id: booking.guestId },
          });
          otherPartyName = guest?.name || 'Unknown';
        }

        return {
          bookingId: booking.id,
          listingTitle: booking.listing.title,
          otherPartyName,
          lastMessageContent: lastMessage.content,
          lastMessageAt: lastMessage.createdAt,
          unreadCount,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          bookingStatus: booking.status,
        };
      }),
    );

    return {
      conversations: conversations
        .filter((c) => c !== null)
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        ),
    };
  }

  async getRecipientId(
    bookingId: number,
    senderId: number,
  ): Promise<number | null> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['listing'],
    });

    if (!booking) return null;

    if (booking.guestId === senderId) {
      return booking.listing.hostId;
    }
    return booking.guestId;
  }

  async getSenderName(senderId: number): Promise<string> {
    const account = await this.accountRepo.findOne({
      where: { id: senderId },
    });
    return account?.name || 'Unknown';
  }
}
