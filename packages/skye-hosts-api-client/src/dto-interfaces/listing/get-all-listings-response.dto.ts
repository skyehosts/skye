import type { IHostListingDto } from './get-host-listings-response.dto';

export interface IGetAllListingsResponseDto {
  listings: IHostListingDto[];
}
