import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { In } from 'typeorm';
import { ListingAccessService } from '../../co-host/providers/listing-access.service';
import { DatabaseService } from '../../common/providers';
import {
  CreateListingRequestDto,
  CreateListingResponseDto,
  GetAllListingsResponseDto,
  GetHostListingsResponseDto,
  GetListingResponseDto,
  UpdateListingRequestDto,
} from '../dto';
import { Listing } from '../entities';

@Injectable()
export class ListingService {
  constructor(
    private databaseService: DatabaseService,
    private listingAccessService: ListingAccessService,
  ) {}

  async create(
    hostId: number,
    dto: CreateListingRequestDto,
  ): Promise<CreateListingResponseDto> {
    const now = new Date();
    const listing = await this.databaseService.getRepository(Listing).save({
      hostId,
      title: dto.title,
      description: dto.description,
      descriptionLong: '',
      guestAccess: '',
      interactionWithGuests: '',
      otherDetailsToNote: '',
      typeId: dto.typeId,
      spaceType: dto.spaceType,
      maxGuests: dto.maxGuests,
      bedrooms: dto.bedrooms,
      beds: dto.beds,
      bathrooms: dto.bathrooms,
      postCode: dto.postCode,
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
    const listings = await this.databaseService.getRepository(Listing).find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });

    return {
      listings: listings.map((listing) => ({
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
      })),
    };
  }

  async getByHostId(accountId: number): Promise<GetHostListingsResponseDto> {
    const ownedListings = await this.databaseService
      .getRepository(Listing)
      .find({ where: { hostId: accountId }, order: { createdAt: 'DESC' } });

    const coHostRoles =
      await this.listingAccessService.getListingRolesForAccount(accountId);
    const coHostListingIds = coHostRoles.map((r) => r.listingId);

    const coHostedListings =
      coHostListingIds.length > 0
        ? await this.databaseService.getRepository(Listing).find({
            where: { id: In(coHostListingIds) },
            order: { createdAt: 'DESC' },
          })
        : [];

    const coHostRoleMap = new Map(
      coHostRoles.map((r) => [r.listingId, r.role]),
    );

    return {
      listings: [
        ...ownedListings.map((listing) => ({
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
        })),
        ...coHostedListings.map((listing) => ({
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
        })),
      ],
    };
  }

  async getById(id: number, hostId?: number): Promise<GetListingResponseDto> {
    const where: { id: number; hostId?: number } = { id };
    if (hostId !== undefined) {
      where.hostId = hostId;
    }

    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.toResponseDto(listing);
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

    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where: { id } });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (dto.title !== undefined) listing.title = dto.title;
    if (dto.description !== undefined) listing.description = dto.description;
    if (dto.descriptionLong !== undefined)
      listing.descriptionLong = dto.descriptionLong;
    if (dto.guestAccess !== undefined) listing.guestAccess = dto.guestAccess;
    if (dto.interactionWithGuests !== undefined)
      listing.interactionWithGuests = dto.interactionWithGuests;
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
    if (dto.status !== undefined) listing.status = dto.status;
    listing.updatedAt = new Date();

    const updated = await this.databaseService
      .getRepository(Listing)
      .save(listing);

    return this.toResponseDto(updated);
  }

  private toResponseDto(listing: Listing): GetListingResponseDto {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      descriptionLong: listing.descriptionLong,
      guestAccess: listing.guestAccess,
      interactionWithGuests: listing.interactionWithGuests,
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
      houseRuleEventsAllowed: listing.houseRuleEventsAllowed,
      houseRuleSmokingAllowed: listing.houseRuleSmokingAllowed,
      houseRuleVapingAllowed: listing.houseRuleVapingAllowed,
      houseRuleQuietHoursEnabled: listing.houseRuleQuietHoursEnabled,
      houseRuleQuietHoursStart: listing.houseRuleQuietHoursStart,
      houseRuleQuietHoursEnd: listing.houseRuleQuietHoursEnd,
      houseRuleOtherRules: listing.houseRuleOtherRules,
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}
