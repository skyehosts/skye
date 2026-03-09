import { IsString } from 'class-validator';
import type { IPinSetupRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class PinSetupRequestDto implements IPinSetupRequestDto {
  @IsString()
  pinHash: string;

  @IsString()
  pinSalt: string;
}
