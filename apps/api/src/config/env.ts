import 'dotenv/config';
import type {
  AuthConfig,
  CookieConfig,
  CookieSameSite,
} from './auth';
import {
  DEFAULT_PROFILE_CACHE_TTL_SECONDS,
  type CacheConfig,
} from './cache';

export interface AppConfig extends AuthConfig {
  port: number;
  databaseUrl: string;
  webOrigins: string[];
  cache: CacheConfig;
}

function readRequired(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value === undefined || value.length === 0 ? undefined : value;
}

function readPort(): number {
  const port = Number(process.env['PORT'] ?? 3001);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${String(process.env['PORT'])}`);
  }

  return port;
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = readOptional(name);

  if (raw === undefined) {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${name} value: ${raw}`);
  }

  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = readOptional(name)?.toLowerCase();

  if (value === undefined) {
    return fallback;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  throw new Error(`Invalid ${name} value: ${value}`);
}

function readSameSite(): CookieSameSite {
  const value = readOptional('COOKIE_SAME_SITE')?.toLowerCase() ?? 'lax';

  if (value === 'lax' || value === 'strict' || value === 'none') {
    return value;
  }

  throw new Error(`Invalid COOKIE_SAME_SITE value: ${value}`);
}

function readCookieConfig(): CookieConfig {
  const sameSite = readSameSite();
  const domain = readOptional('COOKIE_DOMAIN');
  const secure =
    readBoolean('COOKIE_SECURE', process.env['NODE_ENV'] === 'production') ||
    sameSite === 'none';

  return {
    secure,
    sameSite,
    ...(domain === undefined ? {} : { domain }),
  };
}

export function loadConfig(): AppConfig {
  const webOrigins = (process.env['WEB_ORIGIN'] ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const redisUrl = readOptional('REDIS_URL');

  return {
    port: readPort(),
    databaseUrl: readRequired('DATABASE_URL'),
    webOrigins,
    jwtSalt: readRequired('JWT_SALT'),
    cookie: readCookieConfig(),
    cache: {
      profileTtlSeconds: readPositiveInteger(
        'PROFILE_CACHE_TTL_SECONDS',
        DEFAULT_PROFILE_CACHE_TTL_SECONDS,
      ),
      ...(redisUrl === undefined ? {} : { url: redisUrl }),
    },
  };
}
