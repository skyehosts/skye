import type {
  HostInteractionId,
  ListingAccessibilityFeatureId,
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
  PropertySizeUnit,
} from '../../enums/listing-enums';
import type { IListingImageDto } from '../listing-image/listing-image.dto';

export interface IGetListingResponseDto {
  id: number;
  title: string;
  description: string;
  descriptionLong: string;
  guestAccess: string;
  interactionWithGuests: string;
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
  coverImageUrl: string | null;
  images: IListingImageDto[];
  status: ListingStatus;
  shortTermLetLicenseConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
