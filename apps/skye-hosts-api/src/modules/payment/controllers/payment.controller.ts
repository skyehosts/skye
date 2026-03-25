import { Body, Controller, Post } from '@nestjs/common';
import { IPaymentIntentResponseDto } from '@repo/skye-hosts-api-client';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import { AwsQueueSendMessageService } from '../../queue/providers';
import { AwsQueueMessageAction, AwsQueueNames } from '../../queue/types';
import {
  BookingPaymentRequestDto,
  BookingPaymentResponseDto,
  ConfirmPaymentIntentRequestDto,
  CreatePaymentIntentRequestDto,
} from '../dto';
import { PaymentService } from '../providers';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly service: PaymentService,
    private readonly queueService: AwsQueueSendMessageService,
  ) {}

  @Post('create-intent')
  async onCreateIntent(
    @Body() dto: CreatePaymentIntentRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IPaymentIntentResponseDto> {
    return this.service.createIntent(dto, authenticatedUser.sub);
  }

  @Post('confirm-intent')
  async onConfirmIntent(
    @Body() dto: ConfirmPaymentIntentRequestDto,
  ): Promise<IPaymentIntentResponseDto> {
    return this.service.confirmIntent(dto);
  }

  @Post('process-booking-payment')
  @IgnoreBearerAuthentication()
  async onProcessBookingPayment(
    @Body() dto: BookingPaymentRequestDto,
  ): Promise<BookingPaymentResponseDto> {
    // TODO assume payment success for now and add to booking queue
    // Implement payment with stripe later.
    await this.queueService.sendMessage(AwsQueueNames.BOOKINGS, {
      action: AwsQueueMessageAction.BOOKING_PAYMENT_SUCCESSFUL,
      payload: {
        listingId: dto.listingId,
        guestId: dto.guestId,
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        totalPrice: dto.totalPrice,
        numberOfGuests: dto.numberOfGuests ?? 1,
        isTestBooking: dto.isTestBooking ?? false,
      },
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Booking payment processed' };
  }
}
