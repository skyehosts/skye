import type {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSafetyDisclosureId,
  ListingSpaceType,
  ListingStatus,
  ListingTypeId,
  PropertySizeUnit,
} from '@repo/skye-hosts-api-client';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  hostId: number;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'character varying' })
  description: string;

  @Column({ type: 'text', default: '' })
  descriptionLong: string;

  @Column({ type: 'character varying', default: '' })
  guestAccess: string;

  @Column({ type: 'character varying', default: '' })
  interactionWithGuests: string;

  @Column({ type: 'character varying', default: '' })
  otherDetailsToNote: string;

  @Column({ type: 'character varying' })
  typeId: ListingTypeId;

  @Column({ type: 'character varying' })
  spaceType: ListingSpaceType;

  @Column({ type: 'integer' })
  maxGuests: number;

  @Column({ type: 'integer' })
  bedrooms: number;

  @Column({ type: 'integer' })
  beds: number;

  @Column({ type: 'integer' })
  bathrooms: number;

  @Column({ type: 'integer', default: 1 })
  totalFloors: number;

  @Column({ type: 'integer', default: 1 })
  listingFloor: number;

  @Column({ type: 'character varying', default: '' })
  yearBuilt: string;

  @Column({ type: 'character varying', default: '' })
  propertySize: string;

  @Column({ type: 'character varying', default: 'square_metres' })
  propertySizeUnit: PropertySizeUnit;

  @Column({ type: 'character varying' })
  postCode: string;

  @Column({ type: 'simple-array' })
  amenities: ListingAmenityId[];

  @Column({ type: 'simple-array' })
  highlights: ListingHighlightId[];

  @Column({ type: 'character varying' })
  bookingType: ListingBookingType;

  @Column({ type: 'simple-array' })
  safetyDisclosures: ListingSafetyDisclosureId[];

  @Column({ type: 'character varying', nullable: true, default: null })
  checkInTimeStart: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  checkInTimeEnd: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  checkOutTime: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  directions: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  wifiNetwork: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  wifiPassword: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  houseManual: string | null;

  @Column({ type: 'character varying', default: 'Europe/London' })
  timezone: string;

  @Column({ type: 'character varying', default: 'draft' })
  status: ListingStatus;

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone' })
  updatedAt: Date;
}
