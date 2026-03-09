import { IChangePasswordRequestDto } from '@repo/skye-hosts-api-client';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto implements IChangePasswordRequestDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
