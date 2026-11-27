import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, toApiError } from '@/utils/api-client';

const originalAdapter = apiClient.defaults.adapter;

function response(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: '',
    headers: {},
    config,
  };
}

function unauthorized(config: InternalAxiosRequestConfig): never {
  throw new AxiosError(
    'Request failed with status code 401',
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response(config, { error: 'Unauthorized' }, 401),
  );
}

describe('apiClient interceptors', () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('sends cookies with every request and never attaches a bearer token', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config, {}),
    );
    apiClient.defaults.adapter = adapter;

    await apiClient.get('/test');

    const request = adapter.mock.calls[0]?.[0];
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(request?.headers.get('Authorization')).toBeUndefined();
  });

  it('refreshes the cookie session once and retries a 401 request', async () => {
    let attempts = 0;
    apiClient.defaults.adapter = async (config) => {
      attempts += 1;

      if (attempts === 1) {
        unauthorized(config);
      }

      return response(config, { ok: true });
    };
    const refresh = vi
      .spyOn(axios, 'post')
      .mockResolvedValue(response({} as InternalAxiosRequestConfig, {}));

    const result = await apiClient.get('/documents');

    expect(result.data).toEqual({ ok: true });
    expect(attempts).toBe(2);
    expect(refresh).toHaveBeenCalledOnce();
    const [refreshUrl, refreshBody, refreshConfig] = refresh.mock.calls[0] ?? [];
    expect(String(refreshUrl).endsWith('/auth/refresh')).toBe(true);
    expect(refreshBody).toBeNull();
    expect(refreshConfig).toEqual({ withCredentials: true });
  });

  it('does not try to refresh when the auth endpoint itself returns 401', async () => {
    apiClient.defaults.adapter = async (config) => unauthorized(config);
    const refresh = vi.spyOn(axios, 'post');

    await expect(apiClient.post('/auth/login', {})).rejects.toEqual({
      message: 'Unauthorized',
      status: 401,
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('returns the original 401 when the refresh attempt fails', async () => {
    let attempts = 0;
    apiClient.defaults.adapter = async (config) => {
      attempts += 1;
      unauthorized(config);
    };
    const refresh = vi
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('refresh failed'));

    await expect(apiClient.get('/documents')).rejects.toEqual({
      message: 'Unauthorized',
      status: 401,
    });
    expect(attempts).toBe(1);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('normalizes an API error response with field errors', async () => {
    apiClient.defaults.adapter = async (config) => {
      const errorResponse = response(
        config,
        {
          error: 'Validation failed',
          fieldErrors: { email: 'This email is already registered.' },
        },
        409,
      );

      throw new AxiosError(
        'Request failed with status code 409',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        errorResponse,
      );
    };

    await expect(apiClient.post('/auth/signup', {})).rejects.toEqual({
      message: 'Validation failed',
      status: 409,
      fieldErrors: { email: 'This email is already registered.' },
    });
  });

  it('normalizes a network failure', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    };

    await expect(apiClient.get('/health')).rejects.toEqual({
      message:
        'Could not reach the DocuMind API. Check your connection and try again.',
    });
  });

  it('normalizes a plain error', () => {
    expect(toApiError(new Error('boom'))).toEqual({ message: 'boom' });
    expect(toApiError('unexpected')).toEqual({
      message: 'Something went wrong. Please try again.',
    });
  });
});
