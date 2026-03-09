import { IsString, MinLength } from 'class-validator';
import { IResetPasswordRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class ResetPasswordRequestDto implements IResetPasswordRequestDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
