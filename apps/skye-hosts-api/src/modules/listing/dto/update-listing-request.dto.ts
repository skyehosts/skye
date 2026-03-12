import type { IUpdateListingRequestDto } from '@repo/skye-hosts-api-client';
import {
  HostInteractionId,
  LISTING_SPACE_TYPES,
  LISTING_STATUSES,
  LISTING_TYPE_IDS,
  PROPERTY_SIZE_UNITS,
} from '@repo/skye-hosts-api-client';
import {
  IsArray,
  IsBoolean,
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
  @IsString()
  @MaxLength(5)
  checkInTimeStart?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  checkInTimeEnd?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  checkOutTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  directions?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  wifiNetwork?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  wifiPassword?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  houseManual?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionTowels?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionRubbish?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionTurnThingsOff?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionLockUp?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionReturnKeys?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(750)
  checkoutInstructionAdditions?: string | null;

  @IsOptional()
  @IsIn(Object.values(HostInteractionId))
  hostInteraction?: IUpdateListingRequestDto['hostInteraction'];

  @IsOptional()
  @IsBoolean()
  houseRulePetsAllowed?: boolean | null;

  @IsOptional()
  @IsBoolean()
  houseRuleEventsAllowed?: boolean | null;

  @IsOptional()
  @IsBoolean()
  houseRuleSmokingAllowed?: boolean | null;

  @IsOptional()
  @IsBoolean()
  houseRuleVapingAllowed?: boolean | null;

  @IsOptional()
  @IsBoolean()
  houseRuleQuietHoursEnabled?: boolean | null;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  houseRuleQuietHoursStart?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  houseRuleQuietHoursEnd?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  houseRuleOtherRules?: string | null;

  @IsOptional()
  @IsIn(LISTING_STATUSES)
  status?: IUpdateListingRequestDto['status'];
}
