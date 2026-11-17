import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  apiClient,
  setApiAccessToken,
  toApiError,
} from '@/utils/api-client';

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

describe('apiClient interceptors', () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    setApiAccessToken(null);
    vi.restoreAllMocks();
  });

  it('attaches a bearer token when one is set', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config, {}),
    );
    apiClient.defaults.adapter = adapter;
    setApiAccessToken('token-1');

    await apiClient.get('/test');

    const request = adapter.mock.calls[0]?.[0];
    expect(request?.headers.get('Authorization')).toBe('Bearer token-1');
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
