export interface IGetBookingResponseDto {
  id: number;
  listingTitle: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}
