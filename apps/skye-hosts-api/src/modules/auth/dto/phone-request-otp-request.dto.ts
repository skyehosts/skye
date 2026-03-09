import { IsString } from 'class-validator';
import type { IPhoneRequestOtpRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class PhoneRequestOtpRequestDto implements IPhoneRequestOtpRequestDto {
  @IsString()
  phoneNumber: string;
}
