import { IsDateString, IsNumber } from 'class-validator';
import { IBookingPaymentRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

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
