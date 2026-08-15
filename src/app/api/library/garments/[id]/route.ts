import { NextRequest, NextResponse } from 'next/server';
import { readGarmentArchive } from '@/lib/fal-archive';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const archive = await readGarmentArchive(id);
  if (!archive) {
    return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
  }
  return NextResponse.json({
    id,
    modelUrl: archive.modelUrl,
    seed: archive.seed,
    catalogItemId: archive.catalogItemId,
    createdAt: archive.createdAt,
  });
}
