/**
 * Tiny TTL cache. Just enough to keep the OddsAPI free tier alive across
 * frequent dashboard refreshes. Single key cache (per sport plus region).
 */
import type { AggregatedResponse } from "@loa/shared";

interface Entry {
  payload: AggregatedResponse;
  expiresAt: number;
}

const cache = new Map<string, Entry>();

export function getCached(key: string): AggregatedResponse | undefined {
  const e = cache.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return e.payload;
}

export function setCached(key: string, payload: AggregatedResponse, ttlSeconds: number): void {
  cache.set(key, { payload, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function cacheKey(sport: string, region: string): string {
  return `${sport}|${region}`;
}
