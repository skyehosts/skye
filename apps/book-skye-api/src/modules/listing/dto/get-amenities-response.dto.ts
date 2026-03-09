import type {
  IGetAmenitiesResponseDto,
  IListingAmenityCategoryDto,
  IListingAmenityDto,
} from '@repo/skye-hosts-api-client';
import { ListingAmenityId } from '@repo/skye-hosts-api-client';

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
