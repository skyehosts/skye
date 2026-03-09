import { ListingAmenityId } from '../../enums/listing-enums';

export interface IListingAmenityDto {
  id: ListingAmenityId;
  title: string;
  icon: string;
}

export interface IListingAmenityCategoryDto {
  id: string;
  title: string;
  amenities: IListingAmenityDto[];
}

export interface IGetAmenitiesResponseDto {
  categories: IListingAmenityCategoryDto[];
}
