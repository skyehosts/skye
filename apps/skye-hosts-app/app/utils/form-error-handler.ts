import { ApiRequestError } from "@repo/skye-hosts-api-client";
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
 * Simplified error handler for non-form API calls (no field-level errors).
 * Shows the API message for <500 errors, SERVER_ERROR_MESSAGE for 5xx.
 */
export function handleApiError(
  e: unknown,
  setServerError: (message: string) => void,
): void {
  if (e instanceof ApiRequestError && e.statusCode < 500) {
    setServerError(e.message);
    return;
  }
  setServerError(SERVER_ERROR_MESSAGE);
}
