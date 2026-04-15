import { IApiResponse } from './api-response';
import {
  ApiValidationError,
  isApiValidationErrorResponse,
} from './api-validation-error';
import { getApiBaseUrl } from './get-api-base-url';

export class ApiAuthenticationError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number) {
    super(
      statusCode === 498
        ? 'Token expired or invalid'
        : 'Authentication required',
    );
    this.name = 'ApiAuthenticationError';
    this.statusCode = statusCode;
  }
}

export class ApiRequestError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

export const SERVER_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export interface FetchApiOptions {
  method?: string;
  headers?: Record<string, string>;
  baseUrl?: string;
}

export async function fetchApi<TResponse, TBody = never>(
  path: string,
  body?: TBody,
  options?: FetchApiOptions,
): Promise<TResponse> {
  const baseUrl = options?.baseUrl ?? getApiBaseUrl();
  const method = options?.method ?? (body !== undefined ? 'POST' : 'GET');
  const headers: Record<string, string> = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, SERVER_ERROR_MESSAGE);
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 498) {
      throw new ApiAuthenticationError(res.status);
    }
    try {
      const errorBody = await res.json();
      if (res.status === 400 && isApiValidationErrorResponse(errorBody)) {
        throw new ApiValidationError(errorBody.message);
      }
      const message =
        typeof errorBody.message === 'string'
          ? errorBody.message
          : `API request failed: ${res.status} ${res.statusText}`;
      throw new ApiRequestError(res.status, message);
    } catch (e) {
      if (e instanceof ApiValidationError || e instanceof ApiRequestError)
        throw e;
      throw new ApiRequestError(
        res.status,
        `API request failed: ${res.status} ${res.statusText}`,
      );
    }
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as TResponse;
  }
  const data: IApiResponse<TResponse> = await res.json();
  return data.payload as TResponse;
}
