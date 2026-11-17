import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { signup } from '@/services/auth.service';
import { apiClient } from '@/utils/api-client';

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

describe('signup', () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('posts the signup payload and maps the API user', async () => {
    const requests: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(config);

      return response(
        config,
        {
          user: {
            id: 'user-1',
            fullname: 'Avery Morgan',
            email: 'avery@example.com',
            isEmailVerified: false,
          },
        },
        201,
      );
    };

    const result = await signup({
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'Password1',
    });

    expect(result).toEqual({
      ok: true,
      user: {
        id: 'user-1',
        name: 'Avery Morgan',
        email: 'avery@example.com',
        initials: 'AM',
      },
    });

    const request = requests[0];
    expect(request?.url).toBe('/auth/signup');
    expect(request?.method).toBe('post');
    expect(JSON.parse(String(request?.data))).toEqual({
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'Password1',
    });
  });

  it('returns API field errors without throwing', async () => {
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

    const result = await signup({
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'Password1',
    });

    expect(result).toEqual({
      ok: false,
      error: 'Validation failed',
      fieldErrors: { email: 'This email is already registered.' },
    });
  });
});
