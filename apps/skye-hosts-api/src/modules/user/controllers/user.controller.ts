import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import type {
  IAccountAuthenticatedRequestDto,
  IUserSummaryVm,
} from '@repo/skye-hosts-api-client';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  GetEmailSubscriptionsResponseDto,
  SaveEmailSubscriptionsRequestDto,
  UserEditDetailsRequestDto,
} from '../dto';
import { UserService } from '../providers';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Post('authenticated')
  async onAuthenticated(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() dto: IAccountAuthenticatedRequestDto,
  ): Promise<IUserSummaryVm> {
    return this.service.onAuthenticated(authenticatedUser.sub, dto);
  }

  @Post('cookie-usage')
  async onPostCookieUsage(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Query() query: any,
  ): Promise<void> {
    return this.service.toggleCookieUsage(
      authenticatedUser.sub,
      query.enable === 'true',
    );
  }

  @Delete()
  async onDelete(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<any> {
    return this.service.delete(authenticatedUser.sub);
  }

  @Post('edit-details')
  async onEditDetails(
    @Body() dto: UserEditDetailsRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.service.editDetails(authenticatedUser.sub, dto);
  }

  @Post('edit-email')
  async onEditEmail(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Query('email') email: string,
  ): Promise<void> {
    return this.service.editEmail(authenticatedUser.sub, email);
  }

  @Get('has-signed-up')
  @IgnoreBearerAuthentication()
  async onGetHasSignedUp(@Query() params): Promise<boolean> {
    return this.service.hasSignedUp(
      params.id ? Number(params.id) : undefined,
      params.email,
    );
  }

  @Get('email-subscriptions')
  async onGetEmailSubscriptions(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<GetEmailSubscriptionsResponseDto> {
    return this.service.getEmailSubscriptions(authenticatedUser.sub);
  }

  @Post('email-subscriptions')
  async onPostEmailSubscriptions(
    @Body() dto: SaveEmailSubscriptionsRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.service.saveEmailSubscriptions(dto, authenticatedUser.sub);
  }
}
