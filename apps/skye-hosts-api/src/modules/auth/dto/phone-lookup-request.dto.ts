import { IsString } from 'class-validator';
import type { IPhoneLookupRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class PhoneLookupRequestDto implements IPhoneLookupRequestDto {
  @IsString()
  phoneNumber: string;
}
