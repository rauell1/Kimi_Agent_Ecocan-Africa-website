/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, use @upstash/ratelimit with Redis.
 */

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.lastReset > CLEANUP_INTERVAL) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check if a request should be rate-limited.
 * @returns true if the request is rate-limited (should be rejected)
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.lastReset > windowMs) {
    store.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count++;
  return false;
}
