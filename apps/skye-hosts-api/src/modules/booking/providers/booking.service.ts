import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { IPriceBreakdownDto } from '@repo/common';
import * as Sentry from '@sentry/nestjs';
import { DataSource, In, Repository } from 'typeorm';
import { ListingPricingService } from '../../listing/providers/listing-pricing.service';
import { ScheduledMessageCreationService } from '../../scheduled-message/providers/scheduled-message-creation.service';
import { Booking } from '../entities';

interface CreateBookingParams {
  listingId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  isTestBooking?: boolean;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private scheduledMessageCreationService: ScheduledMessageCreationService,
    private listingPricingService: ListingPricingService,
  ) {}

  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const now = new Date();
    let priceBreakdown: IPriceBreakdownDto | null = null;
    let resolvedTotalPrice = params.totalPrice;
    try {
      priceBreakdown = await this.listingPricingService.getBreakdownForBooking(
        params.listingId,
        params.checkInDate,
        params.checkOutDate,
        { adults: params.numberOfGuests, children: 0, babies: 0 },
        now,
      );
      resolvedTotalPrice = priceBreakdown.totalGuestPence / 100;
    } catch (error) {
      this.logger.error(
        `Failed to compute price breakdown for booking on listing ${params.listingId}`,
        error,
      );
      Sentry.captureException(error);
    }

    const booking = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(Booking).save({
        listingId: params.listingId,
        guestId: params.guestId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        totalPrice: resolvedTotalPrice,
        numberOfGuests: params.numberOfGuests,
        status: 'confirmed',
        priceBreakdown,
        createdAt: now,
      } as Booking);

      const listingWithHost = await manager.getRepository(Booking).findOne({
        where: { id: saved.id },
        relations: ['listing'],
      });

      await this.scheduledMessageCreationService.createForBooking(
        saved,
        listingWithHost.listing,
        params.isTestBooking,
        manager,
      );

      return saved;
    });

    this.logger.debug(`Booking #${booking.id} created`);

    return booking;
  }

  async findById(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
    });
  }

  async findByIdWithListing(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['listing'],
    });
  }

  async findByIdForUser(id: number, userId: number): Promise<Booking | null> {
    const booking = await this.bookingRepo.findOne({
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
    return this.bookingRepo.find({
      where: { guestId },
    });
  }

  async findByListingId(listingId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { listingId },
    });
  }

  async findByListingIdWithGuest(listingId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: {
        listingId,
        status: In(['confirmed', 'completed', 'pending']),
      },
      relations: ['guest', 'listing'],
    });
  }
}
