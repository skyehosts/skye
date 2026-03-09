import type { UserRole } from '../../enums/user-role';

export interface IPhoneVerifyOtpResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    phoneNumber: string;
    role: UserRole;
  };
  pin?: {
    hash: string;
    salt: string;
  };
}
