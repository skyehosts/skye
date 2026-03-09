import type { UserRole } from '../../enums/user-role';

export interface ILoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}
