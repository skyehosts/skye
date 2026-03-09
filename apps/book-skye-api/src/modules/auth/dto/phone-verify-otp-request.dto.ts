import type { IPhoneVerifyOtpRequestDto } from '@repo/book-skye-api-client';
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
}
