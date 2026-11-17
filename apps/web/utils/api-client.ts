import axios, { type AxiosInstance } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 15_000,
  });

  client.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

export const apiClient = createApiClient();

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
