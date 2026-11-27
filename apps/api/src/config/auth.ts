export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export const REFRESH_TOKEN_TTL_SECONDS = 30 * 60;

export const ACCESS_TOKEN_COOKIE = 'dm_access_token';

export const REFRESH_TOKEN_COOKIE = 'dm_refresh_token';

export type CookieSameSite = 'lax' | 'strict' | 'none';

export interface CookieConfig {
  domain?: string;
  secure: boolean;
  sameSite: CookieSameSite;
}

export interface AuthConfig {
  jwtSalt: string;
  cookie: CookieConfig;
}
