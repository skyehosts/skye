import type { IRegisterDeviceTokenRequestDto } from '@repo/book-skye-api-client';
import { IsIn, IsString } from 'class-validator';

export class RegisterDeviceTokenRequestDto implements IRegisterDeviceTokenRequestDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}
