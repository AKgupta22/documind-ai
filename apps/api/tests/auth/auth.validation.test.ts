import { describe, expect, it } from 'vitest';
import { validateSignupRequest } from '../../src/services/auth.service.ts';

describe('validateSignupRequest', () => {
  it('trims the name and normalizes the email', () => {
    const result = validateSignupRequest({
      fullname: '  Avery Morgan ',
      email: ' AVERY@Example.COM ',
      password: 'Password1',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        password: 'Password1',
      },
    });
  });

  it('reports every missing field', () => {
    const result = validateSignupRequest({});

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        fullname: 'Full name is required.',
        email: 'Email is required.',
        password: 'Password is required.',
      },
    });
  });

  it('rejects an invalid email and weak password', () => {
    const result = validateSignupRequest({
      fullname: 'Avery Morgan',
      email: 'not-an-email',
      password: 'password',
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        email: 'Enter a valid email address.',
        password: 'Include uppercase, lowercase, and a number.',
      },
    });
  });

  it('rejects passwords longer than the bcrypt input limit', () => {
    const result = validateSignupRequest({
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: `A1${'a'.repeat(71)}`,
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        password: 'Password must be at most 72 bytes.',
      },
    });
  });

  it('rejects a non-object body', () => {
    const result = validateSignupRequest(null);

    expect(result.ok).toBe(false);
  });
});
