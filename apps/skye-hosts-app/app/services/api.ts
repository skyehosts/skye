import {
  fetchApi as baseFetchApi,
  type FetchApiOptions,
} from "../../../../packages/skye-hosts-api-client/src";
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
      console.debug("[fetchApi] token expired, refreshing before", path);
      await ensureValidToken();
    }
  }

  const token = await getToken();
  const hasToken = !!token;
  console.debug(
    `[fetchApi] ${options?.method ?? "POST"} ${path} hasToken=${hasToken}`,
  );

  const headers: Record<string, string> = {
    ...options?.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const result = await baseFetchApi<TResponse, TBody>(path, body, {
      ...options,
      headers,
      baseUrl: getApiBaseUrl(),
    });
    console.debug(`[fetchApi] ${path} succeeded`);
    return result;
  } catch (e) {
    console.error(`[fetchApi] ${path} failed:`, e);
    throw e;
  }
}
