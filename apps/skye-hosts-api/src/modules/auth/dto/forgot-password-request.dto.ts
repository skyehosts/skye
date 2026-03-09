import { IsEmail } from 'class-validator';
import { IForgotPasswordRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class ForgotPasswordRequestDto implements IForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}
