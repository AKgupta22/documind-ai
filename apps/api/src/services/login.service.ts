import type { LoginRequest, LoginUser } from '@documind/shared';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import type { AuthConfig } from '../config/auth';
import type { PrismaClient } from '../generated/prisma/client';
import type { CacheStore } from './cache.service';
import { getProfile } from './profile.service';
import {
  hashRefreshToken,
  issueTokenPair,
  type TokenPair,
  verifyToken,
} from './token.service';
import { validateWithSchema } from './validation.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

export type LoginField = keyof LoginRequest;

export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export type LoginValidationResult =
  | { ok: true; data: LoginRequest }
  | { ok: false; fieldErrors: LoginFieldErrors };

const loginSchema = z.object({
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
    z.string().min(1, 'Password is required.'),
  ),
});

export type LoginFailureReason =
  | 'invalid-credentials'
  | 'email-unverified'
  | 'account-inactive';

export type LoginResult =
  | { ok: true; user: LoginUser; tokens: TokenPair }
  | { ok: false; reason: LoginFailureReason };

export type RefreshResult =
  | { ok: true; user: LoginUser; tokens: TokenPair }
  | { ok: false; reason: LoginFailureReason | 'invalid-refresh-token' };

export type SessionResult =
  | { ok: true; user: LoginUser }
  | { ok: false };

export function validateLoginRequest(body: unknown): LoginValidationResult {
  return validateWithSchema(loginSchema, body);
}

export async function getSessionUser(
  prisma: PrismaClient,
  cache: CacheStore,
  accessToken: string,
  auth: AuthConfig,
  profileCacheTtlSeconds: number,
): Promise<SessionResult> {
  const payload = verifyToken(accessToken, auth.jwtSalt, 'access');

  if (payload === null) {
    return { ok: false };
  }

  const user = await getProfile(
    prisma,
    cache,
    payload.sub,
    profileCacheTtlSeconds,
  );

  if (user === null || !user.isActive || !user.isEmailVerified) {
    return { ok: false };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function loginUser(
  prisma: PrismaClient,
  input: LoginRequest,
  auth: AuthConfig,
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
    select: {
      id: true,
      fullname: true,
      email: true,
      password: true,
      isActive: true,
      isEmailVerified: true,
    },
  });

  if (user === null) {
    return { ok: false, reason: 'invalid-credentials' };
  }

  const passwordMatches = await compare(input.password, user.password);

  if (!passwordMatches) {
    return { ok: false, reason: 'invalid-credentials' };
  }

  if (!user.isEmailVerified) {
    return { ok: false, reason: 'email-unverified' };
  }

  if (!user.isActive) {
    return { ok: false, reason: 'account-inactive' };
  }

  const tokens = issueTokenPair(
    { userId: user.id, email: user.email },
    auth.jwtSalt,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashRefreshToken(tokens.refreshToken) },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    tokens,
  };
}

export async function refreshSession(
  prisma: PrismaClient,
  refreshToken: string,
  auth: AuthConfig,
): Promise<RefreshResult> {
  const payload = verifyToken(refreshToken, auth.jwtSalt, 'refresh');

  if (payload === null) {
    return { ok: false, reason: 'invalid-refresh-token' };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      fullname: true,
      email: true,
      refreshToken: true,
      isActive: true,
      isEmailVerified: true,
    },
  });

  if (
    user === null ||
    user.refreshToken === null ||
    user.refreshToken !== hashRefreshToken(refreshToken)
  ) {
    return { ok: false, reason: 'invalid-refresh-token' };
  }

  if (!user.isEmailVerified) {
    return { ok: false, reason: 'email-unverified' };
  }

  if (!user.isActive) {
    return { ok: false, reason: 'account-inactive' };
  }

  const tokens = issueTokenPair(
    { userId: user.id, email: user.email },
    auth.jwtSalt,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashRefreshToken(tokens.refreshToken) },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    tokens,
  };
}

export async function logoutUser(
  prisma: PrismaClient,
  refreshToken: string,
  auth: AuthConfig,
): Promise<void> {
  const payload = verifyToken(refreshToken, auth.jwtSalt, 'refresh');

  if (payload === null) {
    return;
  }

  await prisma.user.updateMany({
    where: {
      id: payload.sub,
      refreshToken: hashRefreshToken(refreshToken),
    },
    data: { refreshToken: null },
  });
}
