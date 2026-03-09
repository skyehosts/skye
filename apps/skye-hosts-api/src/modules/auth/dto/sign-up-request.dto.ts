import {
  IsBoolean,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import type {
  ISignUpRequestDto,
  SignUpRole,
} from '../../../../../../packages/skye-hosts-api-client/src';
import { Account } from '../../account/entities';
import { UniqueByPropertyValidator } from '../../common/validators';

export class SignUpRequestDto implements ISignUpRequestDto {
  @IsString()
  @Validate(UniqueByPropertyValidator, [Account, 'email'], {
    message: () => {
      return 'An account by this email already exists.';
    },
  })
  email: string;

  @IsString()
  @MaxLength(25)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['guest', 'host'])
  role: SignUpRole;

  @IsBoolean()
  subscribedToNewsViaEmail: boolean;
}
