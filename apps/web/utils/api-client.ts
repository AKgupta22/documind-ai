import {
  AUTH_LOGIN_PATH,
  AUTH_LOGOUT_PATH,
  AUTH_REFRESH_PATH,
  AUTH_SIGNUP_PATH,
} from '@documind/shared';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
).replace(/\/$/, '');

const AUTH_PATHS_WITHOUT_REFRESH = new Set([
  AUTH_SIGNUP_PATH,
  AUTH_LOGIN_PATH,
  AUTH_REFRESH_PATH,
  AUTH_LOGOUT_PATH,
]);

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (refreshPromise === null) {
    refreshPromise = axios
      .post(`${API_URL}${AUTH_REFRESH_PATH}`, null, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 15_000,
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const config = error.config as RetriableRequestConfig | undefined;

        if (
          error.response?.status === 401 &&
          config !== undefined &&
          config._retry !== true &&
          !isAuthPath(config.url)
        ) {
          config._retry = true;

          try {
            await refreshAccessToken();

            return client.request(config);
          } catch {
            // Fall through to the normalized original error.
          }
        }
      }

      return Promise.reject(toApiError(error));
    },
  );

  return client;
}

export const apiClient = createApiClient();

function isAuthPath(url: string | undefined): boolean {
  return url !== undefined && AUTH_PATHS_WITHOUT_REFRESH.has(url);
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (isApiErrorBody(data)) {
      return {
        message: data.error,
        status,
        fieldErrors: isFieldErrors(data.fieldErrors)
          ? data.fieldErrors
          : undefined,
      };
    }

    if (status !== undefined) {
      return { message: `Request failed with status ${status}.`, status };
    }

    return {
      message:
        'Could not reach the DocuMind API. Check your connection and try again.',
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (isApiError(error)) {
    return error;
  }

  return { message: 'Something went wrong. Please try again.' };
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function isApiErrorBody(
  value: unknown,
): value is { error: string; fieldErrors?: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  );
}

function isFieldErrors(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}
