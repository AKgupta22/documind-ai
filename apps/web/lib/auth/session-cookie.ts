import type { AuthUser } from '@/lib/auth/types';

export const MOCK_SESSION_COOKIE = 'dm_mock_session';

export function serializeMockUser(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseMockUser(value: string | undefined): AuthUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'name' in parsed &&
      'email' in parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        initials:
          'initials' in parsed && typeof parsed.initials === 'string'
            ? parsed.initials
            : parsed.name.slice(0, 2).toUpperCase(),
      };
    }
  } catch {
    return null;
  }

  return null;
}
