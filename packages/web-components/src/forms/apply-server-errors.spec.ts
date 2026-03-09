import { applyServerErrors } from './apply-server-errors';

describe('applyServerErrors', () => {
  const setError = jest.fn();

  beforeEach(() => {
    setError.mockClear();
  });

  it('maps field errors to setError calls', () => {
    const error = Object.assign(new Error('Validation failed'), {
      fieldErrors: [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
        {
          property: 'name',
          constraints: {
            maxLength: 'name must be shorter than 100 characters',
          },
        },
      ],
    });

    const result = applyServerErrors(error, setError);

    expect(result).toBe(true);
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'email must be an email',
    });
    expect(setError).toHaveBeenCalledWith('name', {
      type: 'server',
      message: 'name must be shorter than 100 characters',
    });
  });

  it('joins multiple constraints with newline', () => {
    const error = Object.assign(new Error('Validation failed'), {
      fieldErrors: [
        {
          property: 'age',
          constraints: {
            min: 'age must not be less than 18',
            isNumber: 'age must be a number',
          },
        },
      ],
    });

    const result = applyServerErrors(error, setError);

    expect(result).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    const message = setError.mock.calls[0][1].message;
    expect(message).toContain('age must not be less than 18');
    expect(message).toContain('age must be a number');
    expect(message).toContain('\n');
  });

  it('returns false for field errors with no constraints', () => {
    const error = Object.assign(new Error('Validation failed'), {
      fieldErrors: [{ property: 'email' }],
    });

    const result = applyServerErrors(error, setError);

    expect(result).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it('returns false for non-validation errors', () => {
    const error = new Error('Network error');

    const result = applyServerErrors(error, setError);

    expect(result).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it('returns false for non-Error values', () => {
    expect(applyServerErrors('string error', setError)).toBe(false);
    expect(applyServerErrors(null, setError)).toBe(false);
    expect(applyServerErrors(undefined, setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
