import type { IPhoneRequestOtpRequestDto } from '@repo/skye-hosts-api-client';
import { IsString } from 'class-validator';

export class PhoneRequestOtpRequestDto implements IPhoneRequestOtpRequestDto {
  @IsString()
  phoneNumber: string;
}
