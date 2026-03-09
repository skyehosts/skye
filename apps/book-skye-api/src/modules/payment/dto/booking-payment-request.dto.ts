import { IBookingPaymentRequestDto } from '@repo/book-skye-api-client';
import { IsDateString, IsNumber } from 'class-validator';

export class BookingPaymentRequestDto implements IBookingPaymentRequestDto {
  @IsNumber()
  listingId: number;

  @IsNumber()
  guestId: number;

  @IsDateString()
  checkInAt: string;

  @IsDateString()
  checkOutAt: string;

  @IsNumber()
  totalPrice: number;
}
