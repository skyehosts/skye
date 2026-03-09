import type {
  IGetAmenitiesResponseDto,
  IListingAmenityCategoryDto,
  IListingAmenityDto,
} from '../../../../../../packages/skye-hosts-api-client/src';
import { ListingAmenityId } from '../../../../../../packages/skye-hosts-api-client/src';

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
