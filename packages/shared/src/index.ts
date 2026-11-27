export const API_PREFIX = 'api/v1';

export const HEALTH_PATH = '/health';

export const AUTH_PATH = '/auth';

export const AUTH_SIGNUP_PATH = `${AUTH_PATH}/signup`;

export const AUTH_LOGIN_PATH = `${AUTH_PATH}/login`;

export const AUTH_REFRESH_PATH = `${AUTH_PATH}/refresh`;

export const AUTH_LOGOUT_PATH = `${AUTH_PATH}/logout`;

export interface SignupRequest {
  fullname: string;
  email: string;
  password: string;
}

export interface SignupUser {
  id: string;
  fullname: string;
  email: string;
  isEmailVerified: boolean;
}

export interface SignupResponse {
  user: SignupUser;
}

export interface SignupErrorResponse {
  error: string;
  fieldErrors?: Record<string, string>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  fullname: string;
  email: string;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  user: LoginUser;
}

export interface AuthErrorResponse {
  error: string;
  fieldErrors?: Record<string, string>;
}

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
