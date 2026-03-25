import { IBookingPaymentRequestDto } from '@repo/skye-hosts-api-client';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class BookingPaymentRequestDto implements IBookingPaymentRequestDto {
  @IsNumber()
  listingId: number;

  @IsNumber()
  guestId: number;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  numberOfGuests?: number;

  @IsOptional()
  @IsBoolean()
  isTestBooking?: boolean;
}
