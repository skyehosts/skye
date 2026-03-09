import { IForgotPasswordRequestDto } from '@repo/skye-hosts-api-client';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto implements IForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}
