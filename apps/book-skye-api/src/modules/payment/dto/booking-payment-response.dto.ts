import { IBookingPaymentResponseDto } from '@repo/skye-hosts-api-client';

export class BookingPaymentResponseDto implements IBookingPaymentResponseDto {
  success: boolean;
  message: string;
}
