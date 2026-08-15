import { NextRequest, NextResponse } from 'next/server';
import { readBodyArchive } from '@/lib/fal-archive';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const archive = await readBodyArchive(id);
  if (!archive) {
    return NextResponse.json({ error: 'Body not found' }, { status: 404 });
  }
  return NextResponse.json({
    model: archive.virtualHumanModel,
    meta: {
      id: archive.virtualHumanModel.id,
      createdAt: archive.createdAt,
      sessionId: archive.sessionId,
      requestId: archive.requestId,
    },
  });
}
