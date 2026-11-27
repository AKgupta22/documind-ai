'use client';

// TODO: REMOVE MOCK — Replace the remaining password reset and verification simulations with backend integration.
import type { ResetPasswordInput, SimpleAuthResult } from '@/lib/auth/types';
import { MOCK_RESET_TOKEN } from '@/mocks/auth';

function delay(durationMs: number): Promise<void> {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
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
