import type { UserRole } from '../../enums/user-role';

export interface IRefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    phoneNumber: string;
    role: UserRole;
  };
}
