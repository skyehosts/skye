import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  IGetBookingResponseDto,
  IGetListingBookingsResponseDto,
} from '@repo/skye-hosts-api-client';
import {
  AuthenticatedUser,
  AuthoriseRole,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import { SecretAuthenticationGuard } from '../../common/guards';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import { NotificationService } from '../../notification/providers';
import { AwsQueueBaseMessageBody } from '../../queue/types';
import { BookingService } from '../providers';

interface SuccessfulBookingPaymentMessage extends AwsQueueBaseMessageBody {
  action: string;
  payload: {
    listingId: number;
    guestId: number;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    numberOfGuests?: number;
    isTestBooking?: boolean;
  };
  timestamp: string;
}

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    private readonly bookingService: BookingService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('listing/:listingId')
  @AuthoriseRole('host')
  async getListingBookings(
    @Param('listingId', ParseIntPipe) listingId: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IGetListingBookingsResponseDto> {
    const bookings =
      await this.bookingService.findByListingIdWithGuest(listingId);

    if (bookings.length > 0 && bookings[0].listing.hostId !== user.sub) {
      throw new ForbiddenException('You do not have access to this listing');
    }

    return {
      bookings: bookings.map((b) => ({
        id: b.id,
        guestFirstName: b.guest.name.split(' ')[0],
        numberOfGuests: b.numberOfGuests,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        status: b.status,
      })),
    };
  }

  @Get(':id')
  async getBooking(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IGetBookingResponseDto> {
    const booking = await this.bookingService.findByIdForUser(id, user.sub);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      id: booking.id,
      listingTitle: booking.listing.title,
      guestName: booking.guest.name,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  @Post('on-sqs-message-for-successful-booking-payment')
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onSqsBookingMessage(
    @Body() body: SuccessfulBookingPaymentMessage,
  ): Promise<{ received: boolean }> {
    this.logger.debug('SQS booking message received:', JSON.stringify(body));

    const { payload } = body;

    const booking = await this.bookingService.createBooking({
      listingId: payload.listingId,
      guestId: payload.guestId,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      totalPrice: payload.totalPrice,
      numberOfGuests: payload.numberOfGuests ?? 1,
      isTestBooking: payload.isTestBooking,
    });

    const bookingWithListing = await this.bookingService.findByIdWithListing(
      booking.id,
    );

    if (bookingWithListing) {
      await this.notificationService.send({
        recipientAccountId: bookingWithListing.listing.hostId,
        eventType: 'booking_confirmed',
        title: 'Booking Confirmed',
        body: `You have a new booking from ${new Date(payload.checkInDate).toLocaleDateString()} to ${new Date(payload.checkOutDate).toLocaleDateString()}.`,
        data: { bookingId: booking.id, url: `/booking/${booking.id}` },
      });
    }

    return { received: true };
  }
}
