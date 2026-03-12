import { ApiValidationError } from './api-validation-error';
import { ApiAuthenticationError, ApiRequestError, fetchApi } from './fetch-api';

const mockPayload = { id: 1, name: 'Test' };

beforeEach(() => {
  jest.restoreAllMocks();
  process.env.NEXT_PUBLIC_SKYE_HOSTS_API_URL = 'https://api.skyehosts.co.uk';
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SKYE_HOSTS_API_URL;
});

describe('fetchApi', () => {
  it('should GET and return the payload when no body is provided', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ payload: mockPayload }),
    } as unknown as Response);

    const result = await fetchApi('/availability');

    expect(result).toEqual(mockPayload);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.skyehosts.co.uk/availability',
      {
        method: 'GET',
        headers: {},
        body: undefined,
      },
    );
  });

  it('should POST with JSON body when body is provided', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ payload: mockPayload }),
    } as unknown as Response);

    const requestBody = { name: 'World' };
    const result = await fetchApi('/demo', requestBody);

    expect(result).toEqual(mockPayload);
    expect(fetch).toHaveBeenCalledWith('https://api.skyehosts.co.uk/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  });

  it('should throw ApiAuthenticationError on 401', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response);

    try {
      await fetchApi('/protected');
      fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiAuthenticationError);
      expect((e as ApiAuthenticationError).statusCode).toBe(401);
    }
  });

  it('should throw ApiAuthenticationError on 498', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 498,
      statusText: 'Token expired',
    } as Response);

    try {
      await fetchApi('/protected');
      fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiAuthenticationError);
      expect((e as ApiAuthenticationError).statusCode).toBe(498);
    }
  });

  it('should throw on a non-ok response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(fetchApi('/availability')).rejects.toThrow(
      'API request failed: 500 Internal Server Error',
    );
  });

  it('should throw ApiValidationError on 400 with structured field errors', async () => {
    const errorBody = {
      statusCode: 400,
      message: [
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
      error: 'Bad Request',
    };

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => errorBody,
    } as Response);

    try {
      await fetchApi('/demo/form', { bad: 'data' });
      fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiValidationError);
      const err = e as ApiValidationError;
      expect(err.fieldErrors).toHaveLength(2);
      expect(err.fieldErrors[0].property).toBe('email');
      expect(err.fieldErrors[1].constraints).toEqual({
        maxLength: 'name must be shorter than 100 characters',
      });
    }
  });

  it('should throw ApiRequestError with API message on 400 without structured field errors', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Something went wrong' }),
    } as Response);

    await expect(fetchApi('/test')).rejects.toThrow('Something went wrong');
    try {
      await fetchApi('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiRequestError);
      expect((e as ApiRequestError).statusCode).toBe(400);
    }
  });
});
