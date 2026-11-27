import type {
  AuthErrorResponse,
  LoginResponse,
  ProfileResponse,
  SignupErrorResponse,
  SignupResponse,
} from '@documind/shared';
import type { Request, RequestHandler } from 'express';
import type { AuthConfig } from '../config/auth';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../config/auth';
import type { PrismaClient } from '../generated/prisma/client';
import { signupUser, validateSignupRequest } from '../services/auth.service';
import type { CacheStore } from '../services/cache.service';
import {
  clearAuthCookies,
  setAuthCookies,
} from '../services/cookie.service';
import {
  getSessionUser,
  loginUser,
  logoutUser,
  refreshSession,
  validateLoginRequest,
  type LoginFailureReason,
} from '../services/login.service';
import {
  updateProfile,
  validateUpdateProfileRequest,
} from '../services/profile.service';

export function createSignupController(prisma: PrismaClient): RequestHandler {
  return async (request, response) => {
    const validation = validateSignupRequest(request.body);

    if (!validation.ok) {
      const body: SignupErrorResponse = {
        error: 'Validation failed',
        fieldErrors: validation.fieldErrors,
      };

      response.status(400).json(body);
      return;
    }

    const result = await signupUser(prisma, validation.data);

    if (!result.ok) {
      const body: SignupErrorResponse = {
        error: 'An account with this email already exists.',
        fieldErrors: { email: 'This email is already registered.' },
      };

      response.status(409).json(body);
      return;
    }

    const body: SignupResponse = { user: result.user };

    response.status(201).json(body);
  };
}

export function createLoginController(
  prisma: PrismaClient,
  auth: AuthConfig,
): RequestHandler {
  return async (request, response) => {
    const validation = validateLoginRequest(request.body);

    if (!validation.ok) {
      const body: AuthErrorResponse = {
        error: 'Validation failed',
        fieldErrors: validation.fieldErrors,
      };

      response.status(400).json(body);
      return;
    }

    const result = await loginUser(prisma, validation.data, auth);

    if (!result.ok) {
      const failure = loginFailure(result.reason);

      response.status(failure.status).json({ error: failure.error });
      return;
    }

    setAuthCookies(
      response,
      auth.cookie,
      result.tokens,
      ACCESS_TOKEN_TTL_SECONDS,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    const body: LoginResponse = { user: result.user };

    response.status(200).json(body);
  };
}

export function createMeController(
  prisma: PrismaClient,
  auth: AuthConfig,
  cache: CacheStore,
  profileCacheTtlSeconds: number,
): RequestHandler {
  return async (request, response) => {
    const accessToken = readCookie(request, ACCESS_TOKEN_COOKIE);

    if (accessToken === undefined) {
      response.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const result = await getSessionUser(
      prisma,
      cache,
      accessToken,
      auth,
      profileCacheTtlSeconds,
    );

    if (!result.ok) {
      response.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const body: LoginResponse = { user: result.user };

    response.status(200).json(body);
  };
}

export function createUpdateMeController(
  prisma: PrismaClient,
  auth: AuthConfig,
  cache: CacheStore,
  profileCacheTtlSeconds: number,
): RequestHandler {
  return async (request, response) => {
    const accessToken = readCookie(request, ACCESS_TOKEN_COOKIE);

    if (accessToken === undefined) {
      response.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const session = await getSessionUser(
      prisma,
      cache,
      accessToken,
      auth,
      profileCacheTtlSeconds,
    );

    if (!session.ok) {
      response.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const validation = validateUpdateProfileRequest(request.body);

    if (!validation.ok) {
      const body: AuthErrorResponse = {
        error: 'Validation failed',
        fieldErrors: validation.fieldErrors,
      };

      response.status(400).json(body);
      return;
    }

    const user = await updateProfile(
      prisma,
      cache,
      session.user.id,
      validation.data,
    );

    if (user === null) {
      response.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const body: ProfileResponse = {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };

    response.status(200).json(body);
  };
}

export function createRefreshController(
  prisma: PrismaClient,
  auth: AuthConfig,
): RequestHandler {
  return async (request, response) => {
    const refreshToken = readCookie(request, REFRESH_TOKEN_COOKIE);

    if (refreshToken === undefined) {
      clearAuthCookies(response, auth.cookie);
      response.status(401).json({ error: 'Refresh token is missing.' });
      return;
    }

    const result = await refreshSession(prisma, refreshToken, auth);

    if (!result.ok) {
      clearAuthCookies(response, auth.cookie);
      response.status(401).json({ error: 'Session has expired.' });
      return;
    }

    setAuthCookies(
      response,
      auth.cookie,
      result.tokens,
      ACCESS_TOKEN_TTL_SECONDS,
      REFRESH_TOKEN_TTL_SECONDS,
    );

    const body: LoginResponse = { user: result.user };

    response.status(200).json(body);
  };
}

export function createLogoutController(
  prisma: PrismaClient,
  auth: AuthConfig,
): RequestHandler {
  return async (request, response) => {
    const refreshToken = readCookie(request, REFRESH_TOKEN_COOKIE);

    clearAuthCookies(response, auth.cookie);

    if (refreshToken !== undefined) {
      try {
        await logoutUser(prisma, refreshToken, auth);
      } catch (error: unknown) {
        console.error('Failed to revoke refresh token', error);
      }
    }

    response.status(204).end();
  };
}

function loginFailure(reason: LoginFailureReason): {
  status: number;
  error: string;
} {
  if (reason === 'email-unverified') {
    return {
      status: 403,
      error: 'Verify your email before signing in.',
    };
  }

  if (reason === 'account-inactive') {
    return {
      status: 403,
      error: 'This account is inactive.',
    };
  }

  return {
    status: 401,
    error: 'Email or password is incorrect.',
  };
}

function readCookie(request: Request, name: string): string | undefined {
  const cookies: unknown = request.cookies;

  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }

  const token = (cookies as Record<string, unknown>)[name];

  return typeof token === 'string' && token.length > 0 ? token : undefined;
}
