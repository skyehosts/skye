import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { ICreateListingRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';
import {
  LISTING_SPACE_TYPES,
  LISTING_TYPE_IDS,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class CreateListingRequestDto implements ICreateListingRequestDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsIn(LISTING_TYPE_IDS)
  typeId: ICreateListingRequestDto['typeId'];

  @IsIn(LISTING_SPACE_TYPES)
  spaceType: ICreateListingRequestDto['spaceType'];

  @IsNumber()
  @Min(1)
  maxGuests: number;

  @IsNumber()
  @Min(0)
  bedrooms: number;

  @IsNumber()
  @Min(1)
  beds: number;

  @IsNumber()
  @Min(1)
  bathrooms: number;

  @IsString()
  @MaxLength(10)
  postCode: string;

  @IsArray()
  @IsString({ each: true })
  amenities: ICreateListingRequestDto['amenities'];

  @IsArray()
  @IsString({ each: true })
  highlights: ICreateListingRequestDto['highlights'];

  @IsString()
  bookingType: ICreateListingRequestDto['bookingType'];

  @IsArray()
  @IsString({ each: true })
  safetyDisclosures: ICreateListingRequestDto['safetyDisclosures'];
}
