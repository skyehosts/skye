export interface IApiFieldError {
  property: string;
  constraints?: Record<string, string>;
  children?: IApiFieldError[];
}

export interface IApiValidationErrorResponse {
  statusCode: 400;
  message: IApiFieldError[];
  error: 'Bad Request';
}

export class ApiValidationError extends Error {
  public readonly fieldErrors: IApiFieldError[];

  constructor(fieldErrors: IApiFieldError[]) {
    super('Validation failed');
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export function isApiValidationErrorResponse(
  body: unknown,
): body is IApiValidationErrorResponse {
  if (typeof body !== 'object' || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    obj.statusCode === 400 &&
    Array.isArray(obj.message) &&
    obj.message.length > 0 &&
    typeof obj.message[0] === 'object' &&
    obj.message[0] !== null &&
    'property' in obj.message[0]
  );
}
