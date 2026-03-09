import { ListingSpaceType } from '../../enums/listing-enums';

export interface IListingSpaceTypeDto {
  id: ListingSpaceType;
  title: string;
  description: string;
}

export interface IGetSpaceTypesResponseDto {
  types: IListingSpaceTypeDto[];
}
