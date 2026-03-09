import { ILoginRequestDto } from '@repo/book-skye-api-client';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto implements ILoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
