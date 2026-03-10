export interface IBookingPaymentRequestDto {
  listingId: number;
  guestId: number;
  checkInAt: string;
  checkOutAt: string;
  totalPrice: number;
  isTestBooking?: boolean;
}

export interface IBookingPaymentResponseDto {
  success: boolean;
  message: string;
}
