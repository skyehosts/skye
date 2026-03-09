import { IsEmail, IsString } from 'class-validator';
import { ILoginRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class LoginRequestDto implements ILoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
