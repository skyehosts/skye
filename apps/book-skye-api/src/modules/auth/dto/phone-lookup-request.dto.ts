import type { IPhoneLookupRequestDto } from '@repo/book-skye-api-client';
import { IsString } from 'class-validator';

export class PhoneLookupRequestDto implements IPhoneLookupRequestDto {
  @IsString()
  phoneNumber: string;
}
