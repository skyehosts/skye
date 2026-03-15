export interface IPhoneVerifyOtpRequestDto {
  phoneNumber: string;
  code: string;
  name?: string;
  email?: string;
}
