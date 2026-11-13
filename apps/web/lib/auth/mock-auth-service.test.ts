import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  login,
  register,
  resetPassword,
  verifyEmail,
} from '@/lib/auth/mock-auth-service';

describe('mock auth service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts the documented demo credentials', async () => {
    const resultPromise = login({
      email: 'demo@documind.ai',
      password: 'Demo@123',
      remember: true,
    });
    await vi.advanceTimersByTimeAsync(600);

    const result = await resultPromise;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.email).toBe('demo@documind.ai');
    }
  });

  it('rejects invalid credentials', async () => {
    const resultPromise = login({
      email: 'demo@documind.ai',
      password: 'wrong-password',
      remember: false,
    });
    await vi.advanceTimersByTimeAsync(600);

    await expect(resultPromise).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining('incorrect'),
    });
  });

  it('rejects registration for the existing demo email', async () => {
    const resultPromise = register({
      name: 'Demo User',
      email: 'demo@documind.ai',
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
      acceptedTerms: true,
    });
    await vi.advanceTimersByTimeAsync(700);

    const result = await resultPromise;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it('validates the mock reset token', async () => {
    const invalidPromise = resetPassword({
      token: 'wrong-token',
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
    });
    await vi.advanceTimersByTimeAsync(600);
    expect(await invalidPromise).toMatchObject({ ok: false });

    const validPromise = resetPassword({
      token: 'mock-reset-token',
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
    });
    await vi.advanceTimersByTimeAsync(600);
    expect(await validPromise).toEqual({ ok: true });
  });

  it('resolves simulated verification', async () => {
    const resultPromise = verifyEmail();
    await vi.advanceTimersByTimeAsync(500);
    await expect(resultPromise).resolves.toEqual({ ok: true });
  });
});
