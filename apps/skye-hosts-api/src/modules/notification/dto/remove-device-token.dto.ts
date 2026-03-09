import type { IRemoveDeviceTokenRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class RemoveDeviceTokenRequestDto implements IRemoveDeviceTokenRequestDto {
  @IsString()
  token: string;
}
