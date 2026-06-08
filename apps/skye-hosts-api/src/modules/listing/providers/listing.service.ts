import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { DataSource, In, MoreThan, Repository } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { Booking } from '../../booking/entities';
import { CalendarBlock, CalendarSync } from '../../calendar-sync/entities';
import { CoHostInvite, ListingUserRole } from '../../co-host/entities';
import { ListingAccessService } from '../../co-host/providers/listing-access.service';
import {
  buildDerivedImageUrl,
  toListingImageDto,
} from '../../common/utils/listing-image-url.util';
import { ConfigService } from '../../config/providers/config.service';
import { Favourite } from '../../favourite/entities';
import { ListingImage } from '../../listing-image/entities';
import {
  MessageLog,
  ScheduledMessage,
  SentMessage,
} from '../../scheduled-message/entities';
import {
  CreateListingRequestDto,
  CreateListingResponseDto,
  GetAllListingsResponseDto,
  GetHomepageListingsResponseDto,
  GetHostListingsResponseDto,
  GetListingResponseDto,
  UpdateListingRequestDto,
} from '../dto';
import { Listing } from '../entities';
import { ListingPricingService } from './listing-pricing.service';

function generateApproximateCoordinates(
  lat: number,
  lng: number,
  radiusMeters = 500,
): { approximateLatitude: number; approximateLongitude: number } {
  const radiusInDegrees = radiusMeters / 111_320;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  return {
    approximateLatitude: lat + distance * Math.cos(angle),
    approximateLongitude:
      lng + (distance * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180),
  };
}

@Injectable()
export class ListingService {
  private readonly cdnDomain: string;

  constructor(
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(ListingImage)
    private readonly listingImageRepo: Repository<ListingImage>,
    private listingAccessService: ListingAccessService,
    private listingPricingService: ListingPricingService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.cdnDomain = this.configService.getAll().awsCloudfrontImagesDomain;
  }

  private buildCoverImageUrl(
    listingId: number,
    imageId: string,
    width = 640,
  ): string {
    return buildDerivedImageUrl(this.cdnDomain, listingId, imageId, width);
  }

  private async getCoverImageMap(
    listingIds: number[],
  ): Promise<Map<number, string>> {
    if (listingIds.length === 0) return new Map();
    const covers = await this.listingImageRepo.find({
      where: { listingId: In(listingIds), position: 0 },
    });
    return new Map(covers.map((c) => [c.listingId, c.id]));
  }

  async create(
    hostId: number,
    dto: CreateListingRequestDto,
  ): Promise<CreateListingResponseDto> {
    const now = new Date();

    const coords =
      dto.latitude !== undefined && dto.longitude !== undefined
        ? {
            latitude: dto.latitude,
            longitude: dto.longitude,
            ...generateApproximateCoordinates(dto.latitude, dto.longitude),
          }
        : {};

    const listing = await this.listingRepo.save({
      hostId,
      title: dto.title,
      description: dto.description,
      descriptionLong: '',
      guestAccess: '',
      otherDetailsToNote: '',
      typeId: dto.typeId,
      spaceType: dto.spaceType,
      maxGuests: dto.maxGuests,
      bedrooms: dto.bedrooms,
      beds: dto.beds,
      bathrooms: dto.bathrooms,
      postCode: dto.postCode,
      ...coords,
      amenities: dto.amenities,
      highlights: dto.highlights,
      bookingType: dto.bookingType,
      safetyDisclosures: dto.safetyDisclosures,
      totalFloors: 1,
      listingFloor: 1,
      yearBuilt: '',
      propertySize: '',
      propertySizeUnit: 'square_metres',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    } as Listing);

    return {
      id: listing.id,
      createdAt: listing.createdAt,
    };
  }

  async getAll(): Promise<GetAllListingsResponseDto> {
    const listings = await this.listingRepo.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });

    const coverMap = await this.getCoverImageMap(listings.map((l) => l.id));

    return {
      listings: listings.map((listing) => {
        const coverId = coverMap.get(listing.id);
        return {
          id: listing.id,
          title: listing.title,
          typeId: listing.typeId,
          spaceType: listing.spaceType,
          maxGuests: listing.maxGuests,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          postCode: listing.postCode,
          status: listing.status,
          createdAt: listing.createdAt,
          role: 'owner' as const,
          coverImageUrl: coverId
            ? this.buildCoverImageUrl(listing.id, coverId)
            : null,
        };
      }),
    };
  }

  async getHomepage(): Promise<GetHomepageListingsResponseDto> {
    const listings = await this.listingRepo.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });

    const coverMap = await this.getCoverImageMap(listings.map((l) => l.id));

    return {
      listings: listings.map((listing) => {
        const coverId = coverMap.get(listing.id);
        return {
          id: listing.id,
          title: listing.title,
          typeId: listing.typeId,
          highlights: listing.highlights,
          coverImageUrl: coverId
            ? this.buildCoverImageUrl(listing.id, coverId, 320)
            : null,
        };
      }),
    };
  }

  async getByHostId(accountId: number): Promise<GetHostListingsResponseDto> {
    const ownedListings = await this.listingRepo.find({
      where: { hostId: accountId },
      order: { createdAt: 'DESC' },
    });

    const coHostRoles =
      await this.listingAccessService.getListingRolesForAccount(accountId);
    const coHostListingIds = coHostRoles.map((r) => r.listingId);

    const coHostedListings =
      coHostListingIds.length > 0
        ? await this.listingRepo.find({
            where: { id: In(coHostListingIds) },
            order: { createdAt: 'DESC' },
          })
        : [];

    const coHostRoleMap = new Map(
      coHostRoles.map((r) => [r.listingId, r.role]),
    );

    const allListings = [...ownedListings, ...coHostedListings];
    const coverMap = await this.getCoverImageMap(allListings.map((l) => l.id));

    return {
      listings: [
        ...ownedListings.map((listing) => {
          const coverId = coverMap.get(listing.id);
          return {
            id: listing.id,
            title: listing.title,
            typeId: listing.typeId,
            spaceType: listing.spaceType,
            maxGuests: listing.maxGuests,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            postCode: listing.postCode,
            status: listing.status,
            createdAt: listing.createdAt,
            role: 'owner' as const,
            coverImageUrl: coverId
              ? this.buildCoverImageUrl(listing.id, coverId)
              : null,
          };
        }),
        ...coHostedListings.map((listing) => {
          const coverId = coverMap.get(listing.id);
          return {
            id: listing.id,
            title: listing.title,
            typeId: listing.typeId,
            spaceType: listing.spaceType,
            maxGuests: listing.maxGuests,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            postCode: listing.postCode,
            status: listing.status,
            createdAt: listing.createdAt,
            role: coHostRoleMap.get(listing.id) ?? ('calendar_only' as const),
            coverImageUrl: coverId
              ? this.buildCoverImageUrl(listing.id, coverId)
              : null,
          };
        }),
      ],
    };
  }

  private async findOneOrFail(id: number): Promise<Listing> {
    const listing = await this.listingRepo.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  async getById(id: number): Promise<GetListingResponseDto> {
    const listing = await this.findOneOrFail(id);
    return this.toResponseDto(listing);
  }

  async getByIdForHost(
    id: number,
    accountId: number,
  ): Promise<GetListingResponseDto> {
    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      id,
      ListingPermission.EDIT_LISTING,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view this listing',
      );
    }

    const listing = await this.findOneOrFail(id);
    return this.toResponseDto(listing, true);
  }

  async update(
    id: number,
    accountId: number,
    dto: UpdateListingRequestDto,
  ): Promise<GetListingResponseDto> {
    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      id,
      ListingPermission.EDIT_LISTING,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to edit this listing',
      );
    }

    const listing = await this.findOneOrFail(id);

    if (dto.title !== undefined) listing.title = dto.title;
    if (dto.description !== undefined) listing.description = dto.description;
    if (dto.descriptionLong !== undefined)
      listing.descriptionLong = dto.descriptionLong;
    if (dto.guestAccess !== undefined) listing.guestAccess = dto.guestAccess;
    if (dto.otherDetailsToNote !== undefined)
      listing.otherDetailsToNote = dto.otherDetailsToNote;
    if (dto.typeId !== undefined) listing.typeId = dto.typeId;
    if (dto.spaceType !== undefined) listing.spaceType = dto.spaceType;
    if (dto.maxGuests !== undefined) listing.maxGuests = dto.maxGuests;
    if (dto.bedrooms !== undefined) listing.bedrooms = dto.bedrooms;
    if (dto.beds !== undefined) listing.beds = dto.beds;
    if (dto.bathrooms !== undefined) listing.bathrooms = dto.bathrooms;
    if (dto.totalFloors !== undefined) listing.totalFloors = dto.totalFloors;
    if (dto.listingFloor !== undefined) listing.listingFloor = dto.listingFloor;
    if (dto.yearBuilt !== undefined) listing.yearBuilt = dto.yearBuilt;
    if (dto.propertySize !== undefined) listing.propertySize = dto.propertySize;
    if (dto.propertySizeUnit !== undefined)
      listing.propertySizeUnit = dto.propertySizeUnit;
    if (dto.postCode !== undefined) listing.postCode = dto.postCode;
    if (dto.amenities !== undefined) listing.amenities = dto.amenities;
    if (dto.highlights !== undefined) listing.highlights = dto.highlights;
    if (dto.bookingType !== undefined) listing.bookingType = dto.bookingType;
    if (dto.safetyDisclosures !== undefined)
      listing.safetyDisclosures = dto.safetyDisclosures;
    if (dto.checkInTimeStart !== undefined)
      listing.checkInTimeStart = dto.checkInTimeStart ?? null;
    if (dto.checkInTimeEnd !== undefined)
      listing.checkInTimeEnd = dto.checkInTimeEnd ?? null;
    if (dto.checkOutTime !== undefined)
      listing.checkOutTime = dto.checkOutTime ?? null;
    if (dto.directions !== undefined)
      listing.directions = dto.directions ?? null;
    if (dto.wifiNetwork !== undefined)
      listing.wifiNetwork = dto.wifiNetwork ?? null;
    if (dto.wifiPassword !== undefined)
      listing.wifiPassword = dto.wifiPassword ?? null;
    if (dto.houseManual !== undefined)
      listing.houseManual = dto.houseManual ?? null;
    if (dto.checkoutInstructionTowels !== undefined)
      listing.checkoutInstructionTowels = dto.checkoutInstructionTowels ?? null;
    if (dto.checkoutInstructionRubbish !== undefined)
      listing.checkoutInstructionRubbish =
        dto.checkoutInstructionRubbish ?? null;
    if (dto.checkoutInstructionTurnThingsOff !== undefined)
      listing.checkoutInstructionTurnThingsOff =
        dto.checkoutInstructionTurnThingsOff ?? null;
    if (dto.checkoutInstructionLockUp !== undefined)
      listing.checkoutInstructionLockUp = dto.checkoutInstructionLockUp ?? null;
    if (dto.checkoutInstructionReturnKeys !== undefined)
      listing.checkoutInstructionReturnKeys =
        dto.checkoutInstructionReturnKeys ?? null;
    if (dto.checkoutInstructionAdditions !== undefined)
      listing.checkoutInstructionAdditions =
        dto.checkoutInstructionAdditions ?? null;
    if (dto.hostInteraction !== undefined)
      listing.hostInteraction = dto.hostInteraction ?? null;
    if (dto.houseRulePetsAllowed !== undefined)
      listing.houseRulePetsAllowed = dto.houseRulePetsAllowed ?? null;
    if (dto.houseRuleEventsAllowed !== undefined)
      listing.houseRuleEventsAllowed = dto.houseRuleEventsAllowed ?? null;
    if (dto.houseRuleSmokingAllowed !== undefined)
      listing.houseRuleSmokingAllowed = dto.houseRuleSmokingAllowed ?? null;
    if (dto.houseRuleVapingAllowed !== undefined)
      listing.houseRuleVapingAllowed = dto.houseRuleVapingAllowed ?? null;
    if (dto.houseRuleQuietHoursEnabled !== undefined)
      listing.houseRuleQuietHoursEnabled =
        dto.houseRuleQuietHoursEnabled ?? null;
    if (dto.houseRuleQuietHoursStart !== undefined)
      listing.houseRuleQuietHoursStart = dto.houseRuleQuietHoursStart ?? null;
    if (dto.houseRuleQuietHoursEnd !== undefined)
      listing.houseRuleQuietHoursEnd = dto.houseRuleQuietHoursEnd ?? null;
    if (dto.houseRuleOtherRules !== undefined)
      listing.houseRuleOtherRules = dto.houseRuleOtherRules ?? null;
    if (dto.accessibilityFeatures !== undefined)
      listing.accessibilityFeatures = dto.accessibilityFeatures;
    if (dto.safetyConsiderations !== undefined)
      listing.safetyConsiderations = dto.safetyConsiderations;
    if (dto.safetyDevices !== undefined)
      listing.safetyDevices = dto.safetyDevices;
    if (dto.minNights !== undefined) listing.minNights = dto.minNights;
    if (dto.minNightsByCheckInDay !== undefined)
      listing.minNightsByCheckInDay = dto.minNightsByCheckInDay ?? null;
    if (dto.maxNights !== undefined) listing.maxNights = dto.maxNights ?? null;
    if (dto.status !== undefined) {
      if (dto.status === 'active' && listing.status !== 'active') {
        const isComplete = await this.listingPricingService.hasCompletePricing(
          listing.id,
        );
        if (!isComplete) {
          throw new BadRequestException(
            'Listing pricing must be complete (all three seasons) before publishing',
          );
        }
      }
      listing.status = dto.status;
    }
    if (dto.shortTermLetLicenseConfirmed !== undefined)
      listing.shortTermLetLicenseConfirmed = dto.shortTermLetLicenseConfirmed;
    if (dto.cancellationPolicyShortTerm !== undefined)
      listing.cancellationPolicyShortTerm = dto.cancellationPolicyShortTerm;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      listing.latitude = dto.latitude;
      listing.longitude = dto.longitude;
      const approx = generateApproximateCoordinates(
        dto.latitude,
        dto.longitude,
      );
      listing.approximateLatitude = approx.approximateLatitude;
      listing.approximateLongitude = approx.approximateLongitude;
    }
    if (listing.maxNights !== null) {
      const effectiveMin = listing.minNightsByCheckInDay
        ? Math.max(...Object.values(listing.minNightsByCheckInDay))
        : listing.minNights;
      if (effectiveMin > listing.maxNights) {
        throw new BadRequestException(
          'Minimum nights cannot exceed maximum nights',
        );
      }
    }

    listing.updatedAt = new Date();

    const updated = await this.listingRepo.save(listing);

    return this.toResponseDto(updated, true);
  }

  async delete(listingId: number, accountId: number): Promise<void> {
    await this.findOneOrFail(listingId);

    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      listingId,
      ListingPermission.DELETE_LISTING,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete this listing',
      );
    }

    const futureBookingCount = await this.listingRepo.manager.count(Booking, {
      where: {
        listingId,
        checkOutDate: MoreThan(new Date().toISOString().slice(0, 10)),
        status: 'confirmed',
      },
    });

    if (futureBookingCount > 0) {
      throw new BadRequestException(
        'Cannot delete listing with future confirmed bookings. Please cancel them first.',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const scheduledMessages = await manager.find(ScheduledMessage, {
        where: { listingId },
        select: ['id'],
      });

      if (scheduledMessages.length > 0) {
        const smIds = scheduledMessages.map((sm) => sm.id);
        await manager.delete(SentMessage, { scheduledMessageId: In(smIds) });
        await manager.delete(MessageLog, { scheduledMessageId: In(smIds) });
      }

      await manager.delete(ScheduledMessage, { listingId });
      await manager.delete(Booking, { listingId });
      await manager.delete(CoHostInvite, { listingId });
      await manager.delete(ListingUserRole, { listingId });
      await manager.delete(Favourite, { listingId });
      await manager.delete(CalendarBlock, { listingId });
      await manager.delete(CalendarSync, { listingId });
      await manager.delete(Listing, { id: listingId });
    });
  }

  private toImageDto(image: ListingImage) {
    return toListingImageDto(this.cdnDomain, image);
  }

  private async toResponseDto(
    listing: Listing,
    includeExactCoords = false,
  ): Promise<GetListingResponseDto> {
    const [allImages, host] = await Promise.all([
      this.listingImageRepo.find({
        where: { listingId: listing.id },
        order: { position: 'ASC' },
      }),
      this.accountRepo.findOne({ where: { id: listing.hostId } }),
    ]);

    const coverImage = allImages.find((img) => img.position === 0);

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      descriptionLong: listing.descriptionLong,
      guestAccess: listing.guestAccess,
      otherDetailsToNote: listing.otherDetailsToNote,
      typeId: listing.typeId,
      spaceType: listing.spaceType,
      maxGuests: listing.maxGuests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      totalFloors: listing.totalFloors,
      listingFloor: listing.listingFloor,
      yearBuilt: listing.yearBuilt,
      propertySize: listing.propertySize,
      propertySizeUnit: listing.propertySizeUnit,
      postCode: listing.postCode,
      amenities: listing.amenities,
      highlights: listing.highlights,
      bookingType: listing.bookingType,
      safetyDisclosures: listing.safetyDisclosures,
      checkInTimeStart: listing.checkInTimeStart,
      checkInTimeEnd: listing.checkInTimeEnd,
      checkOutTime: listing.checkOutTime,
      directions: listing.directions,
      wifiNetwork: listing.wifiNetwork,
      wifiPassword: listing.wifiPassword,
      houseManual: listing.houseManual,
      checkoutInstructionTowels: listing.checkoutInstructionTowels,
      checkoutInstructionRubbish: listing.checkoutInstructionRubbish,
      checkoutInstructionTurnThingsOff:
        listing.checkoutInstructionTurnThingsOff,
      checkoutInstructionLockUp: listing.checkoutInstructionLockUp,
      checkoutInstructionReturnKeys: listing.checkoutInstructionReturnKeys,
      checkoutInstructionAdditions: listing.checkoutInstructionAdditions,
      hostInteraction: listing.hostInteraction,
      houseRulePetsAllowed: listing.houseRulePetsAllowed,
      houseRuleChildrenAllowed: listing.houseRuleChildrenAllowed,
      houseRuleInfantsAllowed: listing.houseRuleInfantsAllowed,
      houseRuleEventsAllowed: listing.houseRuleEventsAllowed,
      houseRuleSmokingAllowed: listing.houseRuleSmokingAllowed,
      houseRuleVapingAllowed: listing.houseRuleVapingAllowed,
      houseRuleQuietHoursEnabled: listing.houseRuleQuietHoursEnabled,
      houseRuleQuietHoursStart: listing.houseRuleQuietHoursStart,
      houseRuleQuietHoursEnd: listing.houseRuleQuietHoursEnd,
      houseRuleOtherRules: listing.houseRuleOtherRules,
      accessibilityFeatures: listing.accessibilityFeatures,
      safetyConsiderations: listing.safetyConsiderations,
      safetyDevices: listing.safetyDevices,
      minNights: listing.minNights,
      minNightsByCheckInDay: listing.minNightsByCheckInDay,
      maxNights: listing.maxNights,
      latitude: includeExactCoords ? listing.latitude : null,
      longitude: includeExactCoords ? listing.longitude : null,
      approximateLatitude: listing.approximateLatitude,
      approximateLongitude: listing.approximateLongitude,
      hostName: host?.name ?? '',
      hostProfilePhotoUrl: host?.profilePhotoKey
        ? `https://${this.cdnDomain}/${host.profilePhotoKey}`
        : null,
      coverImageUrl: coverImage
        ? this.buildCoverImageUrl(listing.id, coverImage.id)
        : null,
      images: allImages.map((img) => this.toImageDto(img)),
      status: listing.status,
      shortTermLetLicenseConfirmed: listing.shortTermLetLicenseConfirmed,
      cancellationPolicyShortTerm: listing.cancellationPolicyShortTerm,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}
