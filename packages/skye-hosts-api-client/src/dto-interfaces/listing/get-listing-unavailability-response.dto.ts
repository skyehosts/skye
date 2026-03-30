export interface IUnavailableDateRange {
  startDate: string;
  endDate: string;
}

export interface IGetListingUnavailabilityResponseDto {
  unavailableDates: IUnavailableDateRange[];
}
