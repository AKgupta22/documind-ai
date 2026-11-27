import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getCurrentUser,
  login,
  logout,
  signup,
} from '@/services/auth.service';
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

describe('auth service', () => {
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

  it('logs in through the API and maps the session user', async () => {
    const requests: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(config);

      return response(config, {
        user: {
          id: 'user-1',
          fullname: 'Avery Morgan',
          email: 'avery@example.com',
          isEmailVerified: true,
        },
      });
    };

    const result = await login({
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
    expect(request?.url).toBe('/auth/login');
    expect(request?.method).toBe('post');
    expect(JSON.parse(String(request?.data))).toEqual({
      email: 'avery@example.com',
      password: 'Password1',
    });
  });

  it('returns login errors without throwing', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Request failed with status code 403',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response(
          config,
          { error: 'Verify your email before signing in.' },
          403,
        ),
      );
    };

    await expect(
      login({ email: 'avery@example.com', password: 'Password1' }),
    ).resolves.toEqual({
      ok: false,
      error: 'Verify your email before signing in.',
      fieldErrors: undefined,
    });
  });

  it('hydrates the current user from /auth/me', async () => {
    const requests: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(config);

      return response(config, {
        user: {
          id: 'user-1',
          fullname: 'Avery Morgan',
          email: 'avery@example.com',
          isEmailVerified: true,
        },
      });
    };

    await expect(getCurrentUser()).resolves.toEqual({
      id: 'user-1',
      name: 'Avery Morgan',
      email: 'avery@example.com',
      initials: 'AM',
    });
    expect(requests[0]?.url).toBe('/auth/me');
    expect(requests[0]?.method).toBe('get');
  });

  it('returns null when there is no authenticated session', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        'Request failed with status code 401',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response(config, { error: 'Not authenticated.' }, 401),
      );
    };
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('no refresh token'));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('posts to the logout endpoint', async () => {
    const requests: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(config);

      return response(config, undefined, 204);
    };

    await logout();

    expect(requests[0]?.url).toBe('/auth/logout');
    expect(requests[0]?.method).toBe('post');
  });
});
