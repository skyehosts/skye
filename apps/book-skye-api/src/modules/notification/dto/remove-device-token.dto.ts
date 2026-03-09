import type { IRemoveDeviceTokenRequestDto } from '@repo/book-skye-api-client';
import { IsString } from 'class-validator';

export class RemoveDeviceTokenRequestDto implements IRemoveDeviceTokenRequestDto {
  @IsString()
  token: string;
}
