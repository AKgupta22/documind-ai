const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return 'Password is required.';
  }
  if (value.length < 8) {
    return 'Use at least 8 characters.';
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Include uppercase, lowercase, and a number.';
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) {
    return 'Confirm your password.';
  }
  if (password !== confirmation) {
    return 'Passwords do not match.';
  }
  return undefined;
}
