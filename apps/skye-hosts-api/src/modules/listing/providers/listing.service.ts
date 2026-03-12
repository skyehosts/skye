import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(private databaseService: DatabaseService) {}

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
      })),
    };
  }

  async getByHostId(hostId: number): Promise<GetHostListingsResponseDto> {
    const listings = await this.databaseService
      .getRepository(Listing)
      .find({ where: { hostId }, order: { createdAt: 'DESC' } });

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
      })),
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
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }

  async update(
    id: number,
    hostId: number,
    dto: UpdateListingRequestDto,
  ): Promise<GetListingResponseDto> {
    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where: { id, hostId } });

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
    if (dto.status !== undefined) listing.status = dto.status;
    listing.updatedAt = new Date();

    const updated = await this.databaseService
      .getRepository(Listing)
      .save(listing);

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      descriptionLong: updated.descriptionLong,
      guestAccess: updated.guestAccess,
      interactionWithGuests: updated.interactionWithGuests,
      otherDetailsToNote: updated.otherDetailsToNote,
      typeId: updated.typeId,
      spaceType: updated.spaceType,
      maxGuests: updated.maxGuests,
      bedrooms: updated.bedrooms,
      beds: updated.beds,
      bathrooms: updated.bathrooms,
      totalFloors: updated.totalFloors,
      listingFloor: updated.listingFloor,
      yearBuilt: updated.yearBuilt,
      propertySize: updated.propertySize,
      propertySizeUnit: updated.propertySizeUnit,
      postCode: updated.postCode,
      amenities: updated.amenities,
      highlights: updated.highlights,
      bookingType: updated.bookingType,
      safetyDisclosures: updated.safetyDisclosures,
      checkInTimeStart: updated.checkInTimeStart,
      checkInTimeEnd: updated.checkInTimeEnd,
      checkOutTime: updated.checkOutTime,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
