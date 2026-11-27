import type { UpdateProfileRequest } from '@documind/shared';
import { z } from 'zod';
import type { PrismaClient } from '../generated/prisma/client';
import type { CacheStore } from './cache.service';
import { validateWithSchema } from './validation.service';

const MAX_FULLNAME_LENGTH = 100;

export interface ProfileRecord {
  id: string;
  fullname: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export type UpdateProfileField = keyof UpdateProfileRequest;

export type UpdateProfileFieldErrors = Partial<
  Record<UpdateProfileField, string>
>;

export type UpdateProfileValidationResult =
  | { ok: true; data: UpdateProfileRequest }
  | { ok: false; fieldErrors: UpdateProfileFieldErrors };

const updateProfileSchema = z.object({
  fullname: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z
      .string()
      .min(1, 'Full name is required.')
      .min(2, 'Full name must be at least 2 characters.')
      .max(
        MAX_FULLNAME_LENGTH,
        `Full name must be at most ${MAX_FULLNAME_LENGTH} characters.`,
      ),
  ),
});

export function profileCacheKey(userId: string): string {
  return `profile:${userId}`;
}

export function validateUpdateProfileRequest(
  body: unknown,
): UpdateProfileValidationResult {
  return validateWithSchema(updateProfileSchema, body);
}

export async function getProfile(
  prisma: PrismaClient,
  cache: CacheStore,
  userId: string,
  ttlSeconds: number,
): Promise<ProfileRecord | null> {
  const key = profileCacheKey(userId);
  const cached = await cache.get<ProfileRecord>(key);

  if (cached !== null) {
    return cached;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      email: true,
      isActive: true,
      isEmailVerified: true,
    },
  });

  if (user === null) {
    return null;
  }

  await cache.set(key, user, ttlSeconds);

  return user;
}

export async function updateProfile(
  prisma: PrismaClient,
  cache: CacheStore,
  userId: string,
  input: UpdateProfileRequest,
): Promise<ProfileRecord | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullname: input.fullname },
      select: {
        id: true,
        fullname: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    await cache.delete(profileCacheKey(userId));

    return user;
  } catch (error: unknown) {
    if (isRecordNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  );
}
