import {
  ApiAuthenticationError,
  ApiRequestError,
} from "@repo/skye-hosts-api-client";
import { applyServerErrors } from "@repo/web-components/forms/apply-server-errors";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { createLogger } from "../services/logger";
import { captureException } from "../services/error-reporting";

const log = createLogger("handleApiError");

export const SERVER_ERROR_MESSAGE =
  "Something has gone wrong. Our dev team is looking into it, please try again later.";

export function handleFormError<T extends FieldValues>(
  e: unknown,
  setError: UseFormSetError<T>,
  setServerError: (message: string) => void,
): void {
  if (applyServerErrors(e, setError)) return;
  captureException(e);
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
    log.warn(
      `ApiAuthenticationError: status=${e.statusCode} message="${e.message}"`,
    );
  } else if (e instanceof ApiRequestError) {
    if (e.statusCode < 500) {
      setServerError(e.message);
      return;
    }
    captureException(e);
  } else {
    captureException(e);
  }
  setServerError(SERVER_ERROR_MESSAGE);
}
