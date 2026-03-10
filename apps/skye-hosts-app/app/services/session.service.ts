import type {
  IRefreshTokenRequestDto,
  IRefreshTokenResponseDto,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  fetchApi as baseFetchApi,
  type FetchApiOptions,
} from "../../../../packages/skye-hosts-api-client/src";
import { getApiBaseUrl } from "./platform-url";
import {
  getRefreshToken,
  getToken,
  setRefreshToken,
  setStoredUser,
  setToken,
} from "./token.service";
import { isTokenExpired } from "./token-utils.service";

let refreshPromise: Promise<IRefreshTokenResponseDto> | null = null;

export async function refreshSession(): Promise<IRefreshTokenResponseDto> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshTokenValue = await getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const options: FetchApiOptions = {
        baseUrl: getApiBaseUrl(),
      };

      const response = await baseFetchApi<
        IRefreshTokenResponseDto,
        IRefreshTokenRequestDto
      >("/auth/refresh", { refreshToken: refreshTokenValue }, options);

      await setToken(response.accessToken);
      await setRefreshToken(response.refreshToken);
      await setStoredUser(JSON.stringify(response.user));

      return response;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function ensureValidToken(): Promise<boolean> {
  const token = await getToken();
  if (!token) {
    return false;
  }

  if (!isTokenExpired(token)) return true;

  try {
    await refreshSession();
    return true;
  } catch {
    return false;
  }
}

export async function hasSession(): Promise<boolean> {
  const token = await getToken();
  const refreshTokenValue = await getRefreshToken();
  return !!(token || refreshTokenValue);
}
