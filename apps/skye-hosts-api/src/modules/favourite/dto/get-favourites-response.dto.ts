import type {
  IFavouriteListingDto,
  IGetFavouritesResponseDto,
} from '@repo/skye-hosts-api-client';

export class FavouriteListingDto implements IFavouriteListingDto {
  id: number;
  listingId: number;
  title: string;
  typeId: IFavouriteListingDto['typeId'];
  coverImageUrl: string | null;
  favouritedAt: string;
}

export class GetFavouritesResponseDto implements IGetFavouritesResponseDto {
  favourites: FavouriteListingDto[];
}
