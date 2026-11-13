import { describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { parseMockUser, serializeMockUser } from '@/lib/auth/session-cookie';

const user: AuthUser = {
  id: 'user-demo',
  name: 'Avery Morgan',
  email: 'demo@documind.ai',
  initials: 'AM',
};

describe('mock session cookie serialization', () => {
  it('round-trips a user', () => {
    const parsed = parseMockUser(serializeMockUser(user));
    expect(parsed).toEqual(user);
  });

  it('returns null for missing or malformed values', () => {
    expect(parseMockUser(undefined)).toBeNull();
    expect(parseMockUser('not-json')).toBeNull();
    expect(parseMockUser(encodeURIComponent('{"id":1}'))).toBeNull();
  });

  it('derives initials when an older session omits them', () => {
    const value = encodeURIComponent(
      JSON.stringify({ id: 'user-1', name: 'Sam Lee', email: 'sam@example.com' }),
    );
    expect(parseMockUser(value)?.initials).toBe('SA');
  });
});
