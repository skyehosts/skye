export interface IGetBookingResponseDto {
  id: number;
  listingTitle: string;
  guestName: string;
  checkInAt: string;
  checkOutAt: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}
