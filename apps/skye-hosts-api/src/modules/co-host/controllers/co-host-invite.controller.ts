import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  AcceptCoHostInviteRequestDto,
  AcceptCoHostInviteResponseDto,
  CreateCoHostInviteRequestDto,
  CreateCoHostInviteResponseDto,
  GetCoHostInviteDetailsResponseDto,
  GetCoHostInvitesResponseDto,
  GetListingCoHostsResponseDto,
  RevokeCoHostInviteRequestDto,
} from '../dto';
import { CoHostInviteService } from '../providers';

@Controller('co-host-invite')
export class CoHostInviteController {
  constructor(private readonly coHostInviteService: CoHostInviteService) {}

  @Post()
  async onCreate(
    @Body() body: CreateCoHostInviteRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<CreateCoHostInviteResponseDto> {
    return this.coHostInviteService.createInvite(
      authenticatedUser.sub,
      body.listingId,
      body.inviteeEmail,
      body.role,
    );
  }

  @Get('details/:token')
  @IgnoreBearerAuthentication()
  async onGetInviteDetails(
    @Param('token') token: string,
  ): Promise<GetCoHostInviteDetailsResponseDto> {
    return this.coHostInviteService.getInviteDetails(token);
  }

  @Post('accept')
  async onAcceptInvite(
    @Body() body: AcceptCoHostInviteRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<AcceptCoHostInviteResponseDto> {
    return this.coHostInviteService.acceptInvite(
      body.token,
      authenticatedUser.sub,
    );
  }

  @Get('listing/:listingId')
  async onGetInvitesForListing(
    @Param('listingId') listingId: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetCoHostInvitesResponseDto> {
    return this.coHostInviteService.getInvitesForListing(
      authenticatedUser.sub,
      Number(listingId),
    );
  }

  @Post('revoke')
  async onRevokeInvite(
    @Body() body: RevokeCoHostInviteRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.coHostInviteService.revokeInvite(
      authenticatedUser.sub,
      body.inviteId,
    );
  }

  @Get('co-hosts/:listingId')
  async onGetCoHosts(
    @Param('listingId') listingId: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetListingCoHostsResponseDto> {
    return this.coHostInviteService.getCoHostsForListing(
      authenticatedUser.sub,
      Number(listingId),
    );
  }

  @Delete('role/:listingUserRoleId')
  async onRemoveCoHost(
    @Param('listingUserRoleId') listingUserRoleId: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.coHostInviteService.removeCoHost(
      authenticatedUser.sub,
      Number(listingUserRoleId),
    );
  }
}
