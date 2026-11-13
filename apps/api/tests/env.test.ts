import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config/env.ts';

describe('loadConfig', () => {
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
});
