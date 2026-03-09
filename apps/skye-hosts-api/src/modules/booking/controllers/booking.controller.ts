import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { IGetBookingResponseDto } from '../../../../../../packages/skye-hosts-api-client/src';
import {
  AuthenticatedUser,
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
    checkInAt: string;
    checkOutAt: string;
    totalPrice: number;
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
      checkInAt: booking.checkInAt.toISOString(),
      checkOutAt: booking.checkOutAt.toISOString(),
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
      checkInAt: payload.checkInAt,
      checkOutAt: payload.checkOutAt,
      totalPrice: payload.totalPrice,
    });

    const bookingWithListing = await this.bookingService.findByIdWithListing(
      booking.id,
    );

    if (bookingWithListing) {
      await this.notificationService.send({
        recipientAccountId: bookingWithListing.listing.hostId,
        eventType: 'booking_confirmed',
        title: 'Booking Confirmed',
        body: `You have a new booking from ${new Date(payload.checkInAt).toLocaleDateString()} to ${new Date(payload.checkOutAt).toLocaleDateString()}.`,
        data: { bookingId: booking.id, url: `/booking/${booking.id}` },
      });
    }

    return { received: true };
  }
}
