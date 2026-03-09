import type { IRegisterDeviceTokenRequestDto } from '@repo/skye-hosts-api-client';
import { IsIn, IsString } from 'class-validator';

export class RegisterDeviceTokenRequestDto implements IRegisterDeviceTokenRequestDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}
