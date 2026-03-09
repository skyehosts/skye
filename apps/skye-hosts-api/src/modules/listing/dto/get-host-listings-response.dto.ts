import type {
  IGetHostListingsResponseDto,
  IHostListingDto,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class HostListingDto implements IHostListingDto {
  id: number;
  title: string;
  typeId: ListingTypeId;
  spaceType: ListingSpaceType;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  postCode: string;
  status: ListingStatus;
  createdAt: Date;
}

export class GetHostListingsResponseDto implements IGetHostListingsResponseDto {
  listings: HostListingDto[];
}
