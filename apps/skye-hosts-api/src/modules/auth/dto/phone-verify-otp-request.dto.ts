import type { IPhoneVerifyOtpRequestDto } from '@repo/skye-hosts-api-client';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class PhoneVerifyOtpRequestDto implements IPhoneVerifyOtpRequestDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
