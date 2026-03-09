import { IsIn, IsString } from 'class-validator';
import type { IRegisterDeviceTokenRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class RegisterDeviceTokenRequestDto implements IRegisterDeviceTokenRequestDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}
