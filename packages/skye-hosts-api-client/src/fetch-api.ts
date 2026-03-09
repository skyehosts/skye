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

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 498) {
      throw new ApiAuthenticationError(res.status);
    }
    if (res.status === 400) {
      try {
        const errorBody = await res.json();
        if (isApiValidationErrorResponse(errorBody)) {
          throw new ApiValidationError(errorBody.message);
        }
      } catch (e) {
        if (e instanceof ApiValidationError) throw e;
      }
    }
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as TResponse;
  }
  const data: IApiResponse<TResponse> = await res.json();
  return data.payload as TResponse;
}
