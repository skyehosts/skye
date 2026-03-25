export interface IBookingPaymentRequestDto {
  listingId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests?: number;
  isTestBooking?: boolean;
}

export interface IBookingPaymentResponseDto {
  success: boolean;
  message: string;
}
