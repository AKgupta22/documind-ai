// TODO: REMOVE MOCK — Replace with actual backend API response.
import type { AuthUser } from '@/lib/auth/types';
import { initialsFromName } from '@/lib/format';

export const DEMO_CREDENTIALS = {
  email: 'demo@documind.ai',
  password: 'Demo@123',
} as const;

export const DEMO_USER: AuthUser = {
  id: 'user-demo',
  name: 'Avery Morgan',
  email: DEMO_CREDENTIALS.email,
  initials: initialsFromName('Avery Morgan'),
};

export const MOCK_RESET_TOKEN = 'mock-reset-token';

export function createMockUser(name: string, email: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    id: `user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
    name: name.trim() || 'DocuMind user',
    email: normalizedEmail,
    initials: initialsFromName(name.trim() || 'DocuMind user'),
  };
}
