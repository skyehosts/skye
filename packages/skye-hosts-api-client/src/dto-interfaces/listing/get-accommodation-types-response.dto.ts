import { ListingTypeId } from '../../enums/listing-enums';

export interface IListingTypeDto {
  id: ListingTypeId;
  title: string;
}

export interface IGetAccommodationTypesResponseDto {
  types: IListingTypeDto[];
}
