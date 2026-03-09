import { IBookingPaymentResponseDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class BookingPaymentResponseDto implements IBookingPaymentResponseDto {
  success: boolean;
  message: string;
}
