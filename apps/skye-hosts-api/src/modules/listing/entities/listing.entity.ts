import type {
  CancellationPolicyShortTermId,
  HostInteractionId,
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
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListingImage } from '../../listing-image/entities';

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

  @Column({ type: 'double precision', nullable: true, default: null })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true, default: null })
  longitude: number | null;

  @Column({ type: 'double precision', nullable: true, default: null })
  approximateLatitude: number | null;

  @Column({ type: 'double precision', nullable: true, default: null })
  approximateLongitude: number | null;

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

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionTowels: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionRubbish: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionTurnThingsOff: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionLockUp: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionReturnKeys: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  checkoutInstructionAdditions: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  hostInteraction: HostInteractionId | null;

  @Column({ type: 'boolean', nullable: true, default: null })
  houseRulePetsAllowed: boolean | null;

  @Column({ type: 'boolean', default: true })
  houseRuleChildrenAllowed: boolean;

  @Column({ type: 'boolean', default: true })
  houseRuleInfantsAllowed: boolean;

  @Column({ type: 'boolean', nullable: true, default: null })
  houseRuleEventsAllowed: boolean | null;

  @Column({ type: 'boolean', nullable: true, default: null })
  houseRuleSmokingAllowed: boolean | null;

  @Column({ type: 'boolean', nullable: true, default: null })
  houseRuleVapingAllowed: boolean | null;

  @Column({ type: 'boolean', nullable: true, default: null })
  houseRuleQuietHoursEnabled: boolean | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  houseRuleQuietHoursStart: string | null;

  @Column({ type: 'character varying', nullable: true, default: null })
  houseRuleQuietHoursEnd: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  houseRuleOtherRules: string | null;

  @Column({ type: 'simple-array', default: '' })
  accessibilityFeatures: ListingAccessibilityFeatureId[];

  @Column({ type: 'simple-array', default: '' })
  safetyConsiderations: string[];

  @Column({ type: 'simple-array', default: '' })
  safetyDevices: string[];

  @Column({ type: 'integer', default: 1 })
  minNights: number;

  @Column({ type: 'json', nullable: true, default: null })
  minNightsByCheckInDay: IMinNightsByCheckInDay | null;

  @Column({ type: 'integer', nullable: true, default: null })
  maxNights: number | null;

  @Column({ type: 'character varying', default: 'Europe/London' })
  timezone: string;

  @Column({ type: 'character varying', default: 'draft' })
  status: ListingStatus;

  @Column({ type: 'boolean', default: false })
  shortTermLetLicenseConfirmed: boolean;

  @Column({ type: 'character varying', default: '5_days' })
  cancellationPolicyShortTerm: CancellationPolicyShortTermId;

  @OneToMany(() => ListingImage, (image) => image.listing)
  images: ListingImage[];

  @Column({ type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp without time zone' })
  updatedAt: Date;
}
