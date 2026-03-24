export interface IAccountPhoneVerifyOtpRequestDto {
  phoneNumber: string;
  code: string;
}

export interface IAccountPhoneVerifyOtpResponseDto {
  phoneNumber: string;
}
