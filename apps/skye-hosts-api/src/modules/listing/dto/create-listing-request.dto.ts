import type { ICreateListingRequestDto } from '@repo/skye-hosts-api-client';
import {
  LISTING_SPACE_TYPES,
  LISTING_TYPE_IDS,
} from '@repo/skye-hosts-api-client';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

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

  @ValidateIf((o) => o.latitude !== undefined || o.longitude !== undefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ValidateIf((o) => o.latitude !== undefined || o.longitude !== undefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
