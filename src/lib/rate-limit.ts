/**
 * In-memory rate limit (swap for Redis in production)
 * Used for API key / session rate limiting.
 */

const windowMs = 60 * 1000; // 1 minute
const maxPerWindow = 60; // 60 requests per minute per key
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  entry.count++;
  if (entry.count > maxPerWindow) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function getApiKeyFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  if (auth?.startsWith('Key ')) return auth.slice(4);
  return null;
}
