import type { CookieOptions, Response } from 'express';
import type { CookieConfig } from '../config/auth';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../config/auth';

export function buildAuthCookieOptions(
  cookie: CookieConfig,
  maxAgeSeconds: number,
): CookieOptions {
  return {
    httpOnly: true,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: '/',
    maxAge: maxAgeSeconds * 1000,
    ...(cookie.domain === undefined ? {} : { domain: cookie.domain }),
  };
}

export function setAuthCookies(
  response: Response,
  cookie: CookieConfig,
  tokens: { accessToken: string; refreshToken: string },
  accessMaxAgeSeconds: number,
  refreshMaxAgeSeconds: number,
): void {
  response.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    buildAuthCookieOptions(cookie, accessMaxAgeSeconds),
  );
  response.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    buildAuthCookieOptions(cookie, refreshMaxAgeSeconds),
  );
}

export function clearAuthCookies(
  response: Response,
  cookie: CookieConfig,
): void {
  const options = buildAuthCookieOptions(cookie, 0);
  delete options.maxAge;

  response.clearCookie(ACCESS_TOKEN_COOKIE, options);
  response.clearCookie(REFRESH_TOKEN_COOKIE, options);
}
