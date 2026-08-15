import { NextResponse } from 'next/server';
import { sessionStore, modelStore } from '@/lib/storage';

/**
 * GET /api/sessions/[id]/model – Get model when session is ready (headless API)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = sessionStore.get(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  if (session.status !== 'ready' || !session.modelId) {
    return NextResponse.json(
      { error: 'Model not ready', status: session.status },
      { status: 202 }
    );
  }
  const model = modelStore.get(session.modelId);
  if (!model) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  }
  return NextResponse.json(model);
}
