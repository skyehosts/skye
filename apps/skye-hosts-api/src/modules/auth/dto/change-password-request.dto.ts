import { IsString, MinLength } from 'class-validator';
import { IChangePasswordRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class ChangePasswordRequestDto implements IChangePasswordRequestDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
