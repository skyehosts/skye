import { IsString } from 'class-validator';
import type { IRemoveDeviceTokenRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class RemoveDeviceTokenRequestDto implements IRemoveDeviceTokenRequestDto {
  @IsString()
  token: string;
}
