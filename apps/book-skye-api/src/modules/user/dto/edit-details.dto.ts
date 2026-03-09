import { IUserEditDetailsRequestDto } from '@repo/skye-hosts-api-client';
import { IsString, MaxLength } from 'class-validator';

export class UserEditDetailsRequestDto implements IUserEditDetailsRequestDto {
  @IsString()
  @MaxLength(25)
  name: string;
}
