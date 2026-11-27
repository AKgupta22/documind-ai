import {
  AUTH_LOGIN_PATH,
  AUTH_LOGOUT_PATH,
  AUTH_ME_PATH,
  AUTH_SIGNUP_PATH,
  type LoginRequest,
  type LoginResponse,
  type SignupRequest,
  type SignupResponse,
} from '@documind/shared';
import type { AuthResult, AuthUser } from '@/lib/auth/types';
import { initialsFromName } from '@/lib/format';
import { apiClient, toApiError } from '@/utils/api-client';

interface ApiUser {
  id: string;
  fullname: string;
  email: string;
  isEmailVerified: boolean;
}

export async function signup(input: SignupRequest): Promise<AuthResult> {
  try {
    const { data } = await apiClient.post<SignupResponse>(
      AUTH_SIGNUP_PATH,
      input,
    );

    return { ok: true, user: toAuthUser(data.user) };
  } catch (error: unknown) {
    const apiError = toApiError(error);

    return {
      ok: false,
      error: apiError.message,
      fieldErrors: apiError.fieldErrors,
    };
  }
}

export async function login(input: LoginRequest): Promise<AuthResult> {
  try {
    const { data } = await apiClient.post<LoginResponse>(
      AUTH_LOGIN_PATH,
      input,
    );

    return { ok: true, user: toAuthUser(data.user) };
  } catch (error: unknown) {
    const apiError = toApiError(error);

    return {
      ok: false,
      error: apiError.message,
      fieldErrors: apiError.fieldErrors,
    };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<LoginResponse>(AUTH_ME_PATH);

    return toAuthUser(data.user);
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH_LOGOUT_PATH);
}

function toAuthUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    name: user.fullname,
    email: user.email,
    initials: initialsFromName(user.fullname),
  };
}
