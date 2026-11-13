import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/auth/validation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
    expect(validateEmail('a@b')).toBe('Enter a valid email address.');
  });

  it('accepts a standard address', () => {
    expect(validateEmail('demo@documind.ai')).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('requires a value', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('requires at least eight characters', () => {
    expect(validatePassword('Ab1')).toBe('Use at least 8 characters.');
  });

  it('requires mixed case and a number', () => {
    expect(validatePassword('alllowercase1')).toBe(
      'Include uppercase, lowercase, and a number.',
    );
  });

  it('accepts the demo password', () => {
    expect(validatePassword('Demo@123')).toBeUndefined();
  });
});

describe('validatePasswordConfirmation', () => {
  it('requires confirmation', () => {
    expect(validatePasswordConfirmation('Demo@123', '')).toBe('Confirm your password.');
  });

  it('rejects mismatched passwords', () => {
    expect(validatePasswordConfirmation('Demo@123', 'Demo@124')).toBe(
      'Passwords do not match.',
    );
  });

  it('accepts matching passwords', () => {
    expect(validatePasswordConfirmation('Demo@123', 'Demo@123')).toBeUndefined();
  });
});
