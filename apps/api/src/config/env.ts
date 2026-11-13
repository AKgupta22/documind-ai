import 'dotenv/config';

export interface AppConfig {
  port: number;
  databaseUrl: string;
  webOrigins: string[];
}

function readRequired(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort(): number {
  const port = Number(process.env['PORT'] ?? 3001);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${String(process.env['PORT'])}`);
  }

  return port;
}

export function loadConfig(): AppConfig {
  const webOrigins = (process.env['WEB_ORIGIN'] ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return {
    port: readPort(),
    databaseUrl: readRequired('DATABASE_URL'),
    webOrigins,
  };
}
