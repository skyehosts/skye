import type {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
  PropertySizeUnit,
} from '../../enums/listing-enums';

export interface IUpdateListingRequestDto {
  title?: string;
  description?: string;
  descriptionLong?: string;
  guestAccess?: string;
  interactionWithGuests?: string;
  otherDetailsToNote?: string;
  typeId?: ListingTypeId;
  spaceType?: ListingSpaceType;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  postCode?: string;
  amenities?: ListingAmenityId[];
  highlights?: ListingHighlightId[];
  bookingType?: ListingBookingType;
  safetyDisclosures?: ListingSafetyDisclosureId[];
  totalFloors?: number;
  listingFloor?: number;
  yearBuilt?: string;
  propertySize?: string;
  propertySizeUnit?: PropertySizeUnit;
  status?: ListingStatus;
}
