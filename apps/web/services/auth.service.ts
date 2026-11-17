import {
  AUTH_SIGNUP_PATH,
  type SignupRequest,
  type SignupResponse,
} from '@documind/shared';
import type { AuthResult, AuthUser } from '@/lib/auth/types';
import { initialsFromName } from '@/lib/format';
import { apiClient, toApiError } from '@/utils/api-client';

export async function signup(input: SignupRequest): Promise<AuthResult> {
  try {
    const { data } = await apiClient.post<SignupResponse>(
      AUTH_SIGNUP_PATH,
      input,
    );

    const user: AuthUser = {
      id: data.user.id,
      name: data.user.fullname,
      email: data.user.email,
      initials: initialsFromName(data.user.fullname),
    };

    return { ok: true, user };
  } catch (error: unknown) {
    const apiError = toApiError(error);

    return {
      ok: false,
      error: apiError.message,
      fieldErrors: apiError.fieldErrors,
    };
  }
}
