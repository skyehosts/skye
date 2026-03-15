import type { IEmailVerifyOtpRequestDto } from '@repo/skye-hosts-api-client';
import { IsEmail, IsString, Length } from 'class-validator';

export class EmailVerifyOtpRequestDto implements IEmailVerifyOtpRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
