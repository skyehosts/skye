import type {
  IGetListingResponseDto,
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
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}
