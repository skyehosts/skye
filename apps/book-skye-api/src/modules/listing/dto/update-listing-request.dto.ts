import type { IUpdateListingRequestDto } from '@repo/book-skye-api-client';
import {
  LISTING_SPACE_TYPES,
  LISTING_STATUSES,
  LISTING_TYPE_IDS,
  PROPERTY_SIZE_UNITS,
} from '@repo/book-skye-api-client';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateListingRequestDto implements IUpdateListingRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionLong?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  guestAccess?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  interactionWithGuests?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  otherDetailsToNote?: string;

  @IsOptional()
  @IsIn(LISTING_TYPE_IDS)
  typeId?: IUpdateListingRequestDto['typeId'];

  @IsOptional()
  @IsIn(LISTING_SPACE_TYPES)
  spaceType?: IUpdateListingRequestDto['spaceType'];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  beds?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bathrooms?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: IUpdateListingRequestDto['amenities'];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: IUpdateListingRequestDto['highlights'];

  @IsOptional()
  @IsString()
  bookingType?: IUpdateListingRequestDto['bookingType'];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyDisclosures?: IUpdateListingRequestDto['safetyDisclosures'];

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalFloors?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  listingFloor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  yearBuilt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  propertySize?: string;

  @IsOptional()
  @IsIn(PROPERTY_SIZE_UNITS)
  propertySizeUnit?: IUpdateListingRequestDto['propertySizeUnit'];

  @IsOptional()
  @IsIn(LISTING_STATUSES)
  status?: IUpdateListingRequestDto['status'];
}
