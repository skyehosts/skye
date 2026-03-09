import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/providers';
import { ScheduledMessageCreationService } from '../../scheduled-message/providers/scheduled-message-creation.service';
import { Booking } from '../entities';

interface CreateBookingParams {
  listingId: number;
  guestId: number;
  checkInAt: string;
  checkOutAt: string;
  totalPrice: number;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private databaseService: DatabaseService,
    private scheduledMessageCreationService: ScheduledMessageCreationService,
  ) {}

  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const queryRunner = await this.databaseService.startTransaction();

    try {
      const booking = await this.databaseService.getRepository(Booking).save({
        listingId: params.listingId,
        guestId: params.guestId,
        checkInAt: new Date(params.checkInAt),
        checkOutAt: new Date(params.checkOutAt),
        totalPrice: params.totalPrice,
        status: 'confirmed',
        createdAt: new Date(),
      } as Booking);

      const listingWithHost = await this.databaseService
        .getRepository(Booking)
        .findOne({
          where: { id: booking.id },
          relations: ['listing'],
        });

      await this.scheduledMessageCreationService.createForBooking(
        booking,
        listingWithHost.listing,
      );

      await queryRunner.commitTransaction();

      this.logger.debug(`Booking #${booking.id} created`);

      return booking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.databaseService.releaseTransaction();
    }
  }

  async findById(id: number): Promise<Booking | null> {
    return this.databaseService.getRepository(Booking).findOne({
      where: { id },
    });
  }

  async findByIdWithListing(id: number): Promise<Booking | null> {
    return this.databaseService.getRepository(Booking).findOne({
      where: { id },
      relations: ['listing'],
    });
  }

  async findByIdForUser(id: number, userId: number): Promise<Booking | null> {
    const booking = await this.databaseService.getRepository(Booking).findOne({
      where: { id },
      relations: ['listing', 'guest'],
    });

    if (!booking) return null;

    const isGuest = booking.guestId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isGuest && !isHost) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  async findByGuestId(guestId: number): Promise<Booking[]> {
    return this.databaseService.getRepository(Booking).find({
      where: { guestId },
    });
  }

  async findByListingId(listingId: number): Promise<Booking[]> {
    return this.databaseService.getRepository(Booking).find({
      where: { listingId },
    });
  }
}
