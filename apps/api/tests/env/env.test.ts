import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../../src/config/env.ts';

describe('loadConfig', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SALT', 'test-jwt-salt');
    vi.stubEnv('COOKIE_DOMAIN', undefined);
    vi.stubEnv('COOKIE_SECURE', undefined);
    vi.stubEnv('COOKIE_SAME_SITE', undefined);
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads defaults for port and web origins', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('PORT', undefined);
    vi.stubEnv('WEB_ORIGIN', undefined);

    const config = loadConfig();
    expect(config.port).toBe(3001);
    expect(config.databaseUrl).toBe('postgresql://localhost:5432/documind');
    expect(config.webOrigins).toEqual(['http://localhost:3000']);
    expect(config.jwtSalt).toBe('test-jwt-salt');
    expect(config.cookie).toEqual({ secure: false, sameSite: 'lax' });
  });

  it('parses multiple comma-separated origins', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('PORT', '4000');
    vi.stubEnv('WEB_ORIGIN', 'http://localhost:3000, https://documind.example');

    const config = loadConfig();
    expect(config.port).toBe(4000);
    expect(config.webOrigins).toEqual([
      'http://localhost:3000',
      'https://documind.example',
    ]);
  });

  it('reads cross-site cookie settings from the environment', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('COOKIE_DOMAIN', '.documind.example');
    vi.stubEnv('COOKIE_SECURE', 'false');
    vi.stubEnv('COOKIE_SAME_SITE', 'none');

    const config = loadConfig();
    expect(config.cookie).toEqual({
      domain: '.documind.example',
      secure: true,
      sameSite: 'none',
    });
  });

  it('defaults to secure cookies in production', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('NODE_ENV', 'production');

    expect(loadConfig().cookie.secure).toBe(true);
  });

  it('rejects an invalid cookie same-site value', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('COOKIE_SAME_SITE', 'sometimes');

    expect(() => loadConfig()).toThrow(
      'Invalid COOKIE_SAME_SITE value: sometimes',
    );
  });

  it('rejects an invalid port', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('PORT', '70000');

    expect(() => loadConfig()).toThrow('Invalid PORT value: 70000');
  });

  it('rejects a missing database URL', () => {
    vi.stubEnv('DATABASE_URL', '');
    expect(() => loadConfig()).toThrow(
      'Missing required environment variable: DATABASE_URL',
    );
  });

  it('rejects a missing JWT salt', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost:5432/documind');
    vi.stubEnv('JWT_SALT', '');

    expect(() => loadConfig()).toThrow(
      'Missing required environment variable: JWT_SALT',
    );
  });
});
