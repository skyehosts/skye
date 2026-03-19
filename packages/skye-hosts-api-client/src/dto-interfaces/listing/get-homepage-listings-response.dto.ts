import type {
  ListingHighlightId,
  ListingTypeId,
} from '../../enums/listing-enums';

export interface IHomepageListingDto {
  id: number;
  title: string;
  typeId: ListingTypeId;
  highlights: ListingHighlightId[];
  coverImageUrl: string | null;
}

export interface IGetHomepageListingsResponseDto {
  listings: IHomepageListingDto[];
}
