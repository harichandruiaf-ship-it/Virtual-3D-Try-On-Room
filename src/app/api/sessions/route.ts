import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sessionStore } from '@/lib/storage';
import type { TryOnSession } from '@/types/session';

/**
 * POST /api/sessions – Create a try-on session (headless API)
 * Body: { merchantId?, productId?, variantId? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = randomUUID();
    const session: TryOnSession = {
      id,
      createdAt: new Date().toISOString(),
      merchantId: body.merchantId,
      productId: body.productId,
      variantId: body.variantId,
      modelId: null,
      status: 'pending_upload',
    };
    sessionStore.set(id, session);
    return NextResponse.json({ sessionId: id, status: session.status });
  } catch (err) {
    console.error('Create session error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}
