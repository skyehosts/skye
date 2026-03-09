import type { IPinSetupRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class PinSetupRequestDto implements IPinSetupRequestDto {
  @IsString()
  pinHash: string;

  @IsString()
  pinSalt: string;
}
