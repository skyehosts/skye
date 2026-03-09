import type { UserRole } from '../../enums/user-role';

export type SignUpRole = Extract<UserRole, 'guest' | 'host'>;

export interface ISignUpRequestDto {
  email: string;
  name: string;
  password: string;
  role: SignUpRole;
  subscribedToNewsViaEmail: boolean;
}
