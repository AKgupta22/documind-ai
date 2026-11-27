export const DEFAULT_PROFILE_CACHE_TTL_SECONDS = 5 * 60;

export interface CacheConfig {
  url?: string;
  profileTtlSeconds: number;
}
