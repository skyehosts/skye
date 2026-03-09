export interface IRegisterDeviceTokenRequestDto {
  token: string;
  platform: 'ios' | 'android';
}

export interface IRegisterDeviceTokenResponseDto {
  registered: boolean;
}

export interface IRemoveDeviceTokenRequestDto {
  token: string;
}

export interface IRemoveDeviceTokenResponseDto {
  removed: boolean;
}
