import type { IPhoneRequestOtpRequestDto } from '@repo/book-skye-api-client';
import { IsString } from 'class-validator';

export class PhoneRequestOtpRequestDto implements IPhoneRequestOtpRequestDto {
  @IsString()
  phoneNumber: string;
}
