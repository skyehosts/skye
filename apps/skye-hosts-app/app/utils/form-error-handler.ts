import {
  ApiAuthenticationError,
  ApiRequestError,
} from "@repo/skye-hosts-api-client";
import { applyServerErrors } from "@repo/web-components/forms/apply-server-errors";
import type { FieldValues, UseFormSetError } from "react-hook-form";

export const SERVER_ERROR_MESSAGE =
  "Something has gone wrong. Our dev team is looking into it, please try again later.";

export function handleFormError<T extends FieldValues>(
  e: unknown,
  setError: UseFormSetError<T>,
  setServerError: (message: string) => void,
): void {
  if (applyServerErrors(e, setError)) return;
  if (e instanceof ApiRequestError && e.statusCode < 500) {
    setServerError(e.message);
    return;
  }
  setServerError(SERVER_ERROR_MESSAGE);
}

/**
 * Extract a user-facing message from an unknown error.
 * Returns the API message for <500 errors, the fallback for 5xx/non-Error values.
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiRequestError && e.statusCode < 500) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return fallback;
}

/**
 * Simplified error handler for non-form API calls (no field-level errors).
 * Shows the API message for <500 errors, SERVER_ERROR_MESSAGE for 5xx.
 */
export function handleApiError(
  e: unknown,
  setServerError: (message: string) => void,
): void {
  if (e instanceof ApiAuthenticationError) {
    console.error(
      `[handleApiError] ApiAuthenticationError: status=${e.statusCode} message="${e.message}"`,
    );
  } else if (e instanceof ApiRequestError) {
    console.error(
      `[handleApiError] ApiRequestError: status=${e.statusCode} message="${e.message}"`,
    );
    if (e.statusCode < 500) {
      setServerError(e.message);
      return;
    }
  } else if (e instanceof Error) {
    console.error(
      `[handleApiError] Error: name="${e.name}" message="${e.message}"`,
    );
  } else {
    console.error("[handleApiError] Unknown error:", e);
  }
  setServerError(SERVER_ERROR_MESSAGE);
}
