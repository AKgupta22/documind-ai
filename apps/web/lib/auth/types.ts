export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SimpleAuthResult = { ok: true } | { ok: false; error: string };
