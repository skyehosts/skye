import type { ListingTypeId } from '../../enums/listing-enums';

export interface IFavouriteListingDto {
  id: number;
  listingId: number;
  title: string;
  typeId: ListingTypeId;
  coverImageUrl: string | null;
  favouritedAt: string;
}

export interface IGetFavouritesResponseDto {
  favourites: IFavouriteListingDto[];
}
