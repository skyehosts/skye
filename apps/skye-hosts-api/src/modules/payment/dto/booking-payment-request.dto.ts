import { IBookingPaymentRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  isTestBooking?: boolean;
}
