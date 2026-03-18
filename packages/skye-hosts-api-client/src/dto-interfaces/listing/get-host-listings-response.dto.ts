import type { ListingRole } from '../../enums/co-host-enums';
import type {
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
} from '../../enums/listing-enums';

export interface IHostListingDto {
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

export interface IGetHostListingsResponseDto {
  listings: IHostListingDto[];
}
