import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  CreateListingRequestDto,
  CreateListingResponseDto,
  GetAllListingsResponseDto,
  GetHostListingsResponseDto,
  GetListingResponseDto,
  UpdateListingRequestDto,
} from '../dto';
import { ListingService } from '../providers';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

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
}
