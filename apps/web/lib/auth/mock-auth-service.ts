'use client';

// TODO: REMOVE MOCK — Replace simulated authentication with the real authentication API.
import type {
  AuthResult,
  LoginInput,
  ResetPasswordInput,
  SimpleAuthResult,
} from '@/lib/auth/types';
import { DEMO_CREDENTIALS, DEMO_USER, MOCK_RESET_TOKEN } from '@/mocks/auth';
import { readMockSession } from '@/lib/auth/session-client';

function delay(durationMs: number): Promise<void> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

export async function login(input: LoginInput): Promise<AuthResult> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  await delay(600);

  if (
    input.email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    input.password === DEMO_CREDENTIALS.password
  ) {
    return { ok: true, user: DEMO_USER };
  }

  return {
    ok: false,
    error: 'Email or password is incorrect. Use the demo credentials shown below.',
  };
}

export async function forgotPassword(email: string): Promise<SimpleAuthResult> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  await delay(500);
  void email;
  return { ok: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<SimpleAuthResult> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  await delay(600);

  if (input.token !== MOCK_RESET_TOKEN) {
    return { ok: false, error: 'This reset link is not valid in the prototype.' };
  }

  return { ok: true };
}

export async function verifyEmail(): Promise<SimpleAuthResult> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  await delay(500);
  return { ok: true };
}

export async function logout(): Promise<void> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  await delay(200);
}

export function getCurrentUser() {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  return readMockSession();
}
