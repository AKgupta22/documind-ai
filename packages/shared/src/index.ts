export const API_PREFIX = 'api/v1';

export const HEALTH_PATH = '/health';

export type ServiceStatus = 'ok' | 'error';

export type DependencyStatus = 'up' | 'down';

export interface HealthResponse {
  status: ServiceStatus;
  service: 'documind-api';
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: DependencyStatus;
    latencyMs: number;
  };
}
