import type {
  IGetAmenitiesResponseDto,
  IListingAmenityCategoryDto,
  IListingAmenityDto,
} from '@repo/book-skye-api-client';
import { ListingAmenityId } from '@repo/book-skye-api-client';

export class ListingAmenityDto implements IListingAmenityDto {
  id: ListingAmenityId;
  title: string;
  icon: string;
}

export class ListingAmenityCategoryDto implements IListingAmenityCategoryDto {
  id: string;
  title: string;
  amenities: ListingAmenityDto[];
}

export class GetAmenitiesResponseDto implements IGetAmenitiesResponseDto {
  categories: ListingAmenityCategoryDto[];
}
