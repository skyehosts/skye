import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export interface ServerFieldError {
  property: string;
  constraints?: Record<string, string>;
  children?: ServerFieldError[];
}

/**
 * Maps server validation errors to react-hook-form field errors.
 *
 * Duck-types the error for a `fieldErrors` array (structurally compatible
 * with ApiValidationError) so packages/ui stays decoupled from api-client.
 *
 * Multiple constraint messages per field are joined with newlines.
 * Returns true if at least one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (
    !(error instanceof Error) ||
    !('fieldErrors' in error) ||
    !Array.isArray((error as { fieldErrors?: unknown }).fieldErrors)
  ) {
    return false;
  }

  const fieldErrors: ServerFieldError[] = (
    error as { fieldErrors: ServerFieldError[] }
  ).fieldErrors;
  let applied = false;

  for (const fieldError of fieldErrors) {
    const messages = fieldError.constraints
      ? Object.values(fieldError.constraints)
      : [];

    if (messages.length > 0) {
      setError(fieldError.property as Path<T>, {
        type: 'server',
        message: messages.join('\n'),
      });
      applied = true;
    }
  }

  return applied;
}
