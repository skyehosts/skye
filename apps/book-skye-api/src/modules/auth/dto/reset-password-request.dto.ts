import { IResetPasswordRequestDto } from '@repo/book-skye-api-client';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordRequestDto implements IResetPasswordRequestDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
