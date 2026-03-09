import type { IPhoneLookupRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class PhoneLookupRequestDto implements IPhoneLookupRequestDto {
  @IsString()
  phoneNumber: string;
}
