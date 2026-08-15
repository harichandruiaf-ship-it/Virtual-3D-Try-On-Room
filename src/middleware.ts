import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getApiKeyFromRequest } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedApi =
    pathname.startsWith('/api/sessions') ||
    pathname.startsWith('/api/catalog/sync') ||
    pathname.startsWith('/api/catalog/generate-3d');
  if (!isProtectedApi) return NextResponse.next();

  // When TRYON_API_KEY is set, external (cross-origin) calls must send key; apply rate limit per key
  const apiKeyEnv = process.env.TRYON_API_KEY;
  const key = getApiKeyFromRequest(request);
  const origin = request.headers.get('origin') || '';
  const sameOrigin = !origin || origin === request.nextUrl.origin;

  if (apiKeyEnv && !sameOrigin) {
    if (key !== apiKeyEnv) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }
    if (key) {
      const rl = checkRateLimit(key);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Too many requests', retryAfter: rl.retryAfter },
          {
            status: 429,
            headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : undefined,
          }
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/sessions/:path*', '/api/catalog/sync', '/api/catalog/generate-3d'],
};
