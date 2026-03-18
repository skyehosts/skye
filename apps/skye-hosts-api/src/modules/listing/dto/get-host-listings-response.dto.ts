import type {
  IGetHostListingsResponseDto,
  IHostListingDto,
  ListingRole,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
} from '@repo/skye-hosts-api-client';

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
  role: ListingRole;
  coverImageUrl: string | null;
}

export class GetHostListingsResponseDto implements IGetHostListingsResponseDto {
  listings: HostListingDto[];
}
