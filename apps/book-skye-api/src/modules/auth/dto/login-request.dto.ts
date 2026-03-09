import { ILoginRequestDto } from '@repo/skye-hosts-api-client';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto implements ILoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
