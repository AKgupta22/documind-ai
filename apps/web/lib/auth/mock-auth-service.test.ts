import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
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
