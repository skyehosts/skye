import {
  ApiRequestError,
  SERVER_ERROR_MESSAGE,
} from '@repo/skye-hosts-api-client';

export { SERVER_ERROR_MESSAGE } from '@repo/skye-hosts-api-client';

/**
 * Extract a user-facing message from an unknown caught error.
 * Shows the API message for client errors (<500), generic fallback otherwise.
 */
export function getDisplayError(e: unknown): string {
  if (e instanceof ApiRequestError && e.statusCode > 0 && e.statusCode < 500) {
    return e.message;
  }
  return SERVER_ERROR_MESSAGE;
}
