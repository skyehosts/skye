import { IsOptional, IsString, MinLength } from 'class-validator';
import type { IPhoneVerifyOtpRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

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
