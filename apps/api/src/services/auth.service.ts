import { createHash, randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import type { SignupRequest } from '@documind/shared';
import type { PrismaClient } from '../generated/prisma/client';
import { sendVerificationEmail } from './email.service';

export const BCRYPT_ROUNDS = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_FULLNAME_LENGTH = 100;
const MAX_PASSWORD_BYTES = 72;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export type SignupField = keyof SignupRequest;

export type SignupFieldErrors = Partial<Record<SignupField, string>>;

export type SignupValidationResult =
  | { ok: true; data: SignupRequest }
  | { ok: false; fieldErrors: SignupFieldErrors };

export type SignupResult =
  | { ok: true; user: { id: string; fullname: string; email: string; isEmailVerified: boolean } }
  | { ok: false; reason: 'email-taken' };

export function validateSignupRequest(body: unknown): SignupValidationResult {
  const input = isRecord(body) ? body : {};
  const fieldErrors: SignupFieldErrors = {};

  const fullname =
    typeof input['fullname'] === 'string' ? input['fullname'].trim() : '';
  const email =
    typeof input['email'] === 'string'
      ? input['email'].trim().toLowerCase()
      : '';
  const password = typeof input['password'] === 'string' ? input['password'] : '';

  if (fullname.length === 0) {
    fieldErrors.fullname = 'Full name is required.';
  } else if (fullname.length < 2) {
    fieldErrors.fullname = 'Full name must be at least 2 characters.';
  } else if (fullname.length > MAX_FULLNAME_LENGTH) {
    fieldErrors.fullname = `Full name must be at most ${MAX_FULLNAME_LENGTH} characters.`;
  }

  if (email.length === 0) {
    fieldErrors.email = 'Email is required.';
  } else if (email.length > MAX_EMAIL_LENGTH) {
    fieldErrors.email = `Email must be at most ${MAX_EMAIL_LENGTH} characters.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (password.length === 0) {
    fieldErrors.password = 'Password is required.';
  } else if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    fieldErrors.password = 'Password must be at most 72 bytes.';
  } else if (password.length < 8) {
    fieldErrors.password = 'Use at least 8 characters.';
  } else if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    fieldErrors.password = 'Include uppercase, lowercase, and a number.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      fullname,
      email,
      password,
    },
  };
}

export async function signupUser(
  prisma: PrismaClient,
  input: SignupRequest,
): Promise<SignupResult> {
  const fullname = input.fullname.trim();
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, reason: 'email-taken' };
  }

  const passwordHash = await hash(input.password, BCRYPT_ROUNDS);
  const { token, tokenHash } = createVerificationToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  try {
    const user = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: {
          fullname,
          email,
          password: passwordHash,
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          isEmailVerified: true,
        },
      });

      await transaction.emailVerification.create({
        data: {
          userId: created.id,
          tokenHash,
          expiresAt,
        },
      });

      return created;
    });

    // TODO: Remove this bypass once email verification is enforced.
    await sendVerificationEmail({ email: user.email, token });

    return { ok: true, user };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, reason: 'email-taken' };
    }

    throw error;
  }
}

function createVerificationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex');

  return {
    token,
    tokenHash: createHash('sha256').update(token).digest('hex'),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
