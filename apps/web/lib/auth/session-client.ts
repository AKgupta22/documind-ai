'use client';

// TODO: REMOVE MOCK — Replace simulated session persistence with real authentication cookies.
import type { AuthUser } from '@/lib/auth/types';
import {
  MOCK_SESSION_COOKIE,
  parseMockUser,
  serializeMockUser,
} from '@/lib/auth/session-cookie';

const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function setMockSession(user: AuthUser, remember: boolean): void {
  const value = serializeMockUser(user);
  const maxAge = remember ? `; max-age=${REMEMBER_MAX_AGE_SECONDS}` : '';
  document.cookie = `${MOCK_SESSION_COOKIE}=${value}; path=/; samesite=lax${maxAge}`;
}

export function clearMockSession(): void {
  document.cookie = `${MOCK_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function readMockSession(): AuthUser | null {
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${MOCK_SESSION_COOKIE}=`));
  if (!match) {
    return null;
  }
  return parseMockUser(match.slice(MOCK_SESSION_COOKIE.length + 1));
}
