import type {
  CancellationPolicyShortTermId,
  HostInteractionId,
  IGetListingResponseDto,
  IListingImageDto,
  IMinNightsByCheckInDay,
  ListingAccessibilityFeatureId,
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
  PropertySizeUnit,
} from '@repo/skye-hosts-api-client';

export class GetListingResponseDto implements IGetListingResponseDto {
  id: number;
  title: string;
  description: string;
  descriptionLong: string;
  guestAccess: string;
  otherDetailsToNote: string;
  typeId: ListingTypeId;
  spaceType: ListingSpaceType;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  postCode: string;
  amenities: ListingAmenityId[];
  highlights: ListingHighlightId[];
  bookingType: ListingBookingType;
  safetyDisclosures: ListingSafetyDisclosureId[];
  totalFloors: number;
  listingFloor: number;
  yearBuilt: string;
  propertySize: string;
  propertySizeUnit: PropertySizeUnit;
  checkInTimeStart: string | null;
  checkInTimeEnd: string | null;
  checkOutTime: string | null;
  directions: string | null;
  wifiNetwork: string | null;
  wifiPassword: string | null;
  houseManual: string | null;
  checkoutInstructionTowels: string | null;
  checkoutInstructionRubbish: string | null;
  checkoutInstructionTurnThingsOff: string | null;
  checkoutInstructionLockUp: string | null;
  checkoutInstructionReturnKeys: string | null;
  checkoutInstructionAdditions: string | null;
  hostInteraction: HostInteractionId | null;
  houseRulePetsAllowed: boolean | null;
  houseRuleChildrenAllowed: boolean;
  houseRuleInfantsAllowed: boolean;
  houseRuleEventsAllowed: boolean | null;
  houseRuleSmokingAllowed: boolean | null;
  houseRuleVapingAllowed: boolean | null;
  houseRuleQuietHoursEnabled: boolean | null;
  houseRuleQuietHoursStart: string | null;
  houseRuleQuietHoursEnd: string | null;
  houseRuleOtherRules: string | null;
  accessibilityFeatures: ListingAccessibilityFeatureId[];
  safetyConsiderations: string[];
  safetyDevices: string[];
  latitude: number | null;
  longitude: number | null;
  approximateLatitude: number | null;
  approximateLongitude: number | null;
  hostName: string;
  hostProfilePhotoUrl: string | null;
  coverImageUrl: string | null;
  images: IListingImageDto[];
  minNights: number;
  minNightsByCheckInDay: IMinNightsByCheckInDay | null;
  maxNights: number | null;
  status: ListingStatus;
  shortTermLetLicenseConfirmed: boolean;
  cancellationPolicyShortTerm: CancellationPolicyShortTermId;
  createdAt: Date;
  updatedAt: Date;
}
