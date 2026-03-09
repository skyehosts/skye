export interface IResetPasswordResponseDto {
  user: {
    id: number;
    email: string;
    name: string;
  };
}
