import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/embed?product_id=...&variant_id=...&session_id=...
 * Returns JSON with embedUrl for the try-on room (headless / widget).
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('product_id') ?? '';
  const variantId = request.nextUrl.searchParams.get('variant_id') ?? '';
  const sessionId = request.nextUrl.searchParams.get('session_id') ?? '';
  const origin = request.nextUrl.origin;
  const embedUrl = new URL('/room', origin);
  if (productId) embedUrl.searchParams.set('product_id', productId);
  if (variantId) embedUrl.searchParams.set('variant_id', variantId);
  if (sessionId) embedUrl.searchParams.set('session_id', sessionId);
  return NextResponse.json({ embedUrl: embedUrl.toString() });
}
