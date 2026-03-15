import type {
  IPhoneLookupRequestDto,
  IPhoneLookupResponseDto,
  IPhoneRequestOtpRequestDto,
  IPhoneRequestOtpResponseDto,
  IPhoneVerifyOtpRequestDto,
  IPhoneVerifyOtpResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { fetchApi } from "./api";
import {
  clearSessionData,
  deleteToken,
  getStoredUser,
  setRefreshToken,
  setStoredUser,
  setToken,
} from "./token.service";

export { getToken } from "./token.service";

export async function requestOtp(
  phoneNumber: string,
): Promise<IPhoneRequestOtpResponseDto> {
  return fetchApi<IPhoneRequestOtpResponseDto, IPhoneRequestOtpRequestDto>(
    "/auth/phone-request-otp",
    { phoneNumber },
  );
}

export async function phoneLookup(
  phoneNumber: string,
): Promise<IPhoneLookupResponseDto> {
  return fetchApi<IPhoneLookupResponseDto, IPhoneLookupRequestDto>(
    "/auth/phone-lookup",
    { phoneNumber },
  );
}

export async function verifyOtp(
  phoneNumber: string,
  code: string,
  name?: string,
  email?: string,
): Promise<IPhoneVerifyOtpResponseDto> {
  const response = await fetchApi<
    IPhoneVerifyOtpResponseDto,
    IPhoneVerifyOtpRequestDto
  >("/auth/phone-verify-otp", {
    phoneNumber,
    code,
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
  } as IPhoneVerifyOtpRequestDto);

  await setToken(response.accessToken);
  await setRefreshToken(response.refreshToken);
  await setStoredUser(JSON.stringify(response.user));

  return response;
}

export async function getUser(): Promise<
  IPhoneVerifyOtpResponseDto["user"] | null
> {
  const userJson = await getStoredUser();
  if (!userJson) return null;
  return JSON.parse(userJson);
}

export async function signOut(): Promise<void> {
  try {
    await fetchApi("/auth/logout", {});
  } catch {
    // Best-effort server logout
  }
  await deleteToken();
  await clearSessionData();
}
