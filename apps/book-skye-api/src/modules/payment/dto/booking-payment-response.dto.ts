import { IBookingPaymentResponseDto } from '@repo/book-skye-api-client';

export class BookingPaymentResponseDto implements IBookingPaymentResponseDto {
  success: boolean;
  message: string;
}
