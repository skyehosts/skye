export interface IListingBookingItemDto {
  id: number;
  guestFirstName: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export interface IGetListingBookingsResponseDto {
  bookings: IListingBookingItemDto[];
}
