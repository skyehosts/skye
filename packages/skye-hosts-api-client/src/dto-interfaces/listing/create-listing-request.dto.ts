import type {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingTypeId,
} from '../../enums/listing-enums';

export interface ICreateListingRequestDto {
  title: string;
  description: string;
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
  latitude?: number;
  longitude?: number;
}
