import {
  fetchApi as baseFetchApi,
  type FetchApiOptions,
} from "@repo/skye-hosts-api-client";
import { ensureValidToken } from "./session.service";
import { getApiBaseUrl } from "./platform-url";
import { getToken } from "./token.service";
import { isTokenExpired } from "./token-utils.service";

export async function fetchApi<TResponse, TBody = never>(
  path: string,
  body?: TBody,
  options?: Omit<FetchApiOptions, "baseUrl">,
): Promise<TResponse> {
  const isAuthEndpoint = path.startsWith("/auth/");

  if (!isAuthEndpoint) {
    const currentToken = await getToken();
    if (currentToken && isTokenExpired(currentToken)) {
      await ensureValidToken();
    }
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    ...options?.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return baseFetchApi<TResponse, TBody>(path, body, {
    ...options,
    headers,
    baseUrl: getApiBaseUrl(),
  });
}
