import {
  ApiValidationError,
  fetchApi as baseFetchApi,
  type FetchApiOptions,
} from "../../../../packages/skye-hosts-api-client/src";
import { createLogger } from "./logger";
import { ensureValidToken } from "./session.service";
import { getApiBaseUrl } from "./platform-url";
import { getToken } from "./token.service";
import { isTokenExpired } from "./token-utils.service";

const log = createLogger("fetchApi");

export async function fetchApi<TResponse, TBody = never>(
  path: string,
  body?: TBody,
  options?: Omit<FetchApiOptions, "baseUrl">,
): Promise<TResponse> {
  const isAuthEndpoint = path.startsWith("/auth/");

  if (!isAuthEndpoint) {
    const currentToken = await getToken();
    if (currentToken && isTokenExpired(currentToken)) {
      log.debug("token expired, refreshing before", path);
      await ensureValidToken();
    }
  }

  const token = await getToken();
  const hasToken = !!token;
  log.debug(`${options?.method ?? "POST"} ${path} hasToken=${hasToken}`);

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
    log.debug(`${path} succeeded`);
    return result;
  } catch (e) {
    if (e instanceof ApiValidationError) {
      log.debug(`${path} validation error`);
    } else {
      log.error(`${path} failed:`, e);
    }
    throw e;
  }
}
