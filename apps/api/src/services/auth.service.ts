import { createHash, randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import type { SignupRequest } from '@documind/shared';
import { z } from 'zod';
import type { PrismaClient } from '../generated/prisma/client';
import { sendVerificationEmail } from './email.service';
import { validateWithSchema } from './validation.service';

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

const signupSchema = z.object({
  fullname: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z
      .string()
      .min(1, 'Full name is required.')
      .min(2, 'Full name must be at least 2 characters.')
      .max(
        MAX_FULLNAME_LENGTH,
        `Full name must be at most ${MAX_FULLNAME_LENGTH} characters.`,
      ),
  ),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''),
    z
      .string()
      .min(1, 'Email is required.')
      .max(
        MAX_EMAIL_LENGTH,
        `Email must be at most ${MAX_EMAIL_LENGTH} characters.`,
      )
      .regex(EMAIL_PATTERN, 'Enter a valid email address.'),
  ),
  password: z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z
      .string()
      .min(1, 'Password is required.')
      .refine(
        (value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES,
        `Password must be at most ${MAX_PASSWORD_BYTES} bytes.`,
      )
      .min(8, 'Use at least 8 characters.')
      .refine(
        (value) =>
          /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value),
        'Include uppercase, lowercase, and a number.',
      ),
  ),
});

export type SignupResult =
  | { ok: true; user: { id: string; fullname: string; email: string; isEmailVerified: boolean } }
  | { ok: false; reason: 'email-taken' };

export function validateSignupRequest(body: unknown): SignupValidationResult {
  return validateWithSchema(signupSchema, body);
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
