import { IForgotPasswordRequestDto } from '@repo/book-skye-api-client';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto implements IForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}
