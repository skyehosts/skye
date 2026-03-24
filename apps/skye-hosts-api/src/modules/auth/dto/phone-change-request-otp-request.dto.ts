import type { IAccountPhoneRequestOtpRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class PhoneChangeRequestOtpRequestDto implements IAccountPhoneRequestOtpRequestDto {
  @IsString()
  phoneNumber: string;
}
