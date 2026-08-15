import { NextRequest, NextResponse } from 'next/server';
import { generateGarmentMeshFromImage } from '@/lib/garment-mesh-generation';
import { setCatalogOverride } from '@/lib/catalog-store';
import { archiveRodinGarment } from '@/lib/fal-archive';

function falErrorPayload(err: unknown): { message: string; status: number } {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status?: number }).status;
    const body = (err as { body?: { detail?: unknown } }).body;
    let message = err instanceof Error ? err.message : 'Generation failed';
    if (body && typeof body.detail === 'string') {
      message = body.detail;
    } else if (body && Array.isArray(body.detail)) {
      message = JSON.stringify(body.detail);
    }
    if (status === 401 || status === 403) {
      return { message, status: 403 };
    }
    if (status === 402 || status === 429) {
      return { message, status };
    }
    if (status && status >= 400 && status < 500) {
      return { message, status };
    }
  }
  if (err instanceof Error) {
    if (err.message.includes('FAL_KEY')) {
      return { message: err.message, status: 503 };
    }
    return { message: err.message, status: 500 };
  }
  return { message: 'Generation failed', status: 500 };
}

/**
 * POST /api/catalog/generate-3d
 * FormData: file (image), optional catalogItemId (patch that item with modelUrl)
 * Returns { modelUrl, seed?, catalogItemId? }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const catalogItemId = formData.get('catalogItemId') as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    const mime = file.type || 'image/jpeg';
    if (!mime.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { modelUrl, seed, requestId, falData } = await generateGarmentMeshFromImage(buffer, mime);

    let garmentId: string | undefined;
    try {
      garmentId = await archiveRodinGarment({
        requestId,
        falData,
        modelUrl,
        seed,
        catalogItemId: catalogItemId ?? undefined,
      });
    } catch (archErr) {
      console.error('archiveRodinGarment:', archErr);
    }

    if (catalogItemId) {
      setCatalogOverride(catalogItemId, { modelUrl });
    }

    return NextResponse.json({
      modelUrl,
      seed,
      garmentId,
      catalogItemId: catalogItemId ?? undefined,
    });
  } catch (err) {
    console.error('generate-3d error:', err);
    const { message, status } = falErrorPayload(err);
    return NextResponse.json({ error: message }, { status });
  }
}
