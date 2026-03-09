import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import type {
  IGetNotificationPreferencesResponseDto,
  IRegisterDeviceTokenResponseDto,
  IRemoveDeviceTokenResponseDto,
  IUpdateNotificationPreferenceResponseDto,
} from '@repo/skye-hosts-api-client';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  RegisterDeviceTokenRequestDto,
  RemoveDeviceTokenRequestDto,
  UpdateNotificationPreferenceRequestDto,
} from '../dto';
import { NotificationService, PushNotificationService } from '../providers';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private pushNotificationService: PushNotificationService,
  ) {}

  @Get('preferences')
  async getPreferences(
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IGetNotificationPreferencesResponseDto> {
    return this.notificationService.getPreferences(user.sub);
  }

  @Put('preferences')
  async updatePreference(
    @AuthenticatedUser() user: IJwtClaims,
    @Body() dto: UpdateNotificationPreferenceRequestDto,
  ): Promise<IUpdateNotificationPreferenceResponseDto> {
    return this.notificationService.updatePreference(
      user.sub,
      dto.eventType,
      dto.pushEnabled,
      dto.emailEnabled,
    );
  }

  @Post('device-token')
  async registerDeviceToken(
    @AuthenticatedUser() user: IJwtClaims,
    @Body() dto: RegisterDeviceTokenRequestDto,
  ): Promise<IRegisterDeviceTokenResponseDto> {
    await this.pushNotificationService.registerDeviceToken(
      user.sub,
      dto.token,
      dto.platform,
    );
    return { registered: true };
  }

  @Delete('device-token')
  async removeDeviceToken(
    @Body() dto: RemoveDeviceTokenRequestDto,
  ): Promise<IRemoveDeviceTokenResponseDto> {
    await this.pushNotificationService.removeDeviceToken(dto.token);
    return { removed: true };
  }
}
