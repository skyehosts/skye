import { IsString, MaxLength } from 'class-validator';
import { IUserEditDetailsRequestDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class UserEditDetailsRequestDto implements IUserEditDetailsRequestDto {
  @IsString()
  @MaxLength(25)
  name: string;
}
