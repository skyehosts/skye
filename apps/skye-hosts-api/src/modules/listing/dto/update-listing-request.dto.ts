import type {
  IMinNightsByCheckInDay,
  IUpdateListingRequestDto,
} from '@repo/skye-hosts-api-client';
import {
  CANCELLATION_POLICY_SHORT_TERM_IDS,
  HostInteractionId,
  LISTING_SPACE_TYPES,
  LISTING_STATUSES,
  LISTING_TYPE_IDS,
  PROPERTY_SIZE_UNITS,
} from '@repo/skye-hosts-api-client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  CheckInEndAfterStart,
  CheckoutBeforeCheckIn,
} from '../validators/check-in-checkout-time.validator';

class MinNightsByCheckInDayDto implements IMinNightsByCheckInDay {
  @IsNumber()
  @Min(1)
  @Max(30)
  monday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  tuesday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  wednesday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  thursday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  friday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  saturday: number;

  @IsNumber()
  @Min(1)
  @Max(30)
  sunday: number;
}

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
  @Validate(CheckInEndAfterStart)
  checkInTimeEnd?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  @Validate(CheckoutBeforeCheckIn)
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
  houseRuleChildrenAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  houseRuleInfantsAllowed?: boolean;

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
  @IsArray()
  @IsString({ each: true })
  accessibilityFeatures?: IUpdateListingRequestDto['accessibilityFeatures'];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyConsiderations?: IUpdateListingRequestDto['safetyConsiderations'];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyDevices?: IUpdateListingRequestDto['safetyDevices'];

  @IsOptional()
  @IsIn(LISTING_STATUSES)
  status?: IUpdateListingRequestDto['status'];

  @IsOptional()
  @IsBoolean()
  shortTermLetLicenseConfirmed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  minNights?: number;

  @IsOptional()
  @ValidateIf((o) => o.minNightsByCheckInDay !== null)
  @IsObject()
  @ValidateNested()
  @Type(() => MinNightsByCheckInDayDto)
  minNightsByCheckInDay?: IMinNightsByCheckInDay | null;

  @IsOptional()
  @ValidateIf((o) => o.maxNights !== null)
  @IsNumber()
  @Min(1)
  @Max(30)
  maxNights?: number | null;

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

  @IsOptional()
  @IsIn(CANCELLATION_POLICY_SHORT_TERM_IDS)
  cancellationPolicyShortTerm?: IUpdateListingRequestDto['cancellationPolicyShortTerm'];
}
