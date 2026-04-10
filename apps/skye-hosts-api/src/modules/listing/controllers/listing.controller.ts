import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import type { IGetListingUnavailabilityResponseDto } from '@repo/skye-hosts-api-client';
import { CalendarSyncService } from '../../calendar-sync/providers';
import {
  AuthenticatedUser,
  AuthoriseRole,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  CreateListingRequestDto,
  CreateListingResponseDto,
  GetAllListingsResponseDto,
  GetHomepageListingsResponseDto,
  GetHostListingsResponseDto,
  GetListingResponseDto,
  UpdateListingRequestDto,
} from '../dto';
import { ListingService } from '../providers';

@Controller('listing')
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    private readonly calendarSyncService: CalendarSyncService,
  ) {}

  @Post()
  async onCreate(
    @Body() body: CreateListingRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<CreateListingResponseDto> {
    return this.listingService.create(authenticatedUser.sub, body);
  }

  @Get()
  async onGetHostListings(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetHostListingsResponseDto> {
    return this.listingService.getByHostId(authenticatedUser.sub);
  }

  @Get('all')
  @IgnoreBearerAuthentication()
  async onGetAllListings(): Promise<GetAllListingsResponseDto> {
    return this.listingService.getAll();
  }

  @Get('homepage')
  @IgnoreBearerAuthentication()
  async onGetHomepageListings(): Promise<GetHomepageListingsResponseDto> {
    return this.listingService.getHomepage();
  }

  @Get(':id/unavailability')
  @IgnoreBearerAuthentication()
  async onGetUnavailability(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IGetListingUnavailabilityResponseDto> {
    const unavailableDates =
      await this.calendarSyncService.getUnavailabilityForListing(id);
    return { unavailableDates };
  }

  @Get(':id/edit')
  async onGetListingForHost(
    @Param('id') id: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetListingResponseDto> {
    return this.listingService.getByIdForHost(
      Number(id),
      authenticatedUser.sub,
    );
  }

  @Get(':id')
  @IgnoreBearerAuthentication()
  async onGetListing(@Param('id') id: string): Promise<GetListingResponseDto> {
    return this.listingService.getById(Number(id));
  }

  @Patch(':id')
  async onUpdateListing(
    @Param('id') id: string,
    @Body() body: UpdateListingRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetListingResponseDto> {
    return this.listingService.update(Number(id), authenticatedUser.sub, body);
  }

  @Delete(':id')
  @AuthoriseRole('host')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onDeleteListing(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.listingService.delete(id, authenticatedUser.sub);
  }
}
