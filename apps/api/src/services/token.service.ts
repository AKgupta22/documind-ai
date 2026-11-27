import { createHash, randomUUID } from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../config/auth';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'documind-api';
const JWT_AUDIENCE = 'documind-web';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  type: TokenType;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenOwner {
  userId: string;
  email: string;
}

export function issueTokenPair(
  owner: TokenOwner,
  jwtSalt: string,
): TokenPair {
  return {
    accessToken: signToken(owner, jwtSalt, 'access', ACCESS_TOKEN_TTL_SECONDS),
    refreshToken: signToken(
      owner,
      jwtSalt,
      'refresh',
      REFRESH_TOKEN_TTL_SECONDS,
    ),
  };
}

export function verifyToken(
  token: string,
  jwtSalt: string,
  type: TokenType,
): TokenPayload | null {
  try {
    const payload = jwt.verify(token, jwtSalt, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (
      typeof payload === 'string' ||
      payload.type !== type ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function signToken(
  owner: TokenOwner,
  jwtSalt: string,
  type: TokenType,
  expiresInSeconds: number,
): string {
  return jwt.sign(
    { email: owner.email, type },
    jwtSalt,
    {
      algorithm: JWT_ALGORITHM,
      audience: JWT_AUDIENCE,
      expiresIn: expiresInSeconds,
      issuer: JWT_ISSUER,
      jwtid: randomUUID(),
      subject: owner.userId,
    },
  );
}
