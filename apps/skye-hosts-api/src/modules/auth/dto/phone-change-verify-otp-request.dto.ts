import type { IAccountPhoneVerifyOtpRequestDto } from '@repo/skye-hosts-api-client';
import { IsString, Length } from 'class-validator';

export class PhoneChangeVerifyOtpRequestDto implements IAccountPhoneVerifyOtpRequestDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
