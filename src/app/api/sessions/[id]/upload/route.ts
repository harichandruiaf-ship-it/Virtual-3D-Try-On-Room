import { NextRequest, NextResponse } from 'next/server';
import { sessionStore, modelStore } from '@/lib/storage';
import { saveUpload, deleteUpload } from '@/lib/file-storage';
import { validateUpload } from '@/lib/upload-validation';
import { runAnalysisPipeline } from '@/lib/analysis-pipeline';
import { archiveSam3dBody } from '@/lib/fal-archive';

/**
 * POST /api/sessions/[id]/upload – Upload reference image (or video) and run analysis
 * FormData: file (image preferred), heightCm (number), gender (optional)
 * Returns model when ready (or error)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const session = sessionStore.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  if (session.status !== 'pending_upload') {
    return NextResponse.json(
      { error: 'Session already has upload or is analyzing' },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const heightCm = formData.get('heightCm');
  const gender = formData.get('gender') as string | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const validation = validateUpload({ type: file.type, size: file.size });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  // TODO: implement full image validation later (min resolution, aspect ratio, content checks)

  // Only accept images for 3D pipeline (client can extract frame from video and send as image)
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  if (!isImage) {
    return NextResponse.json(
      { error: 'Please upload an image (JPEG, PNG, WebP). For video, use our app to capture a frame first.' },
      { status: 400 }
    );
  }

  const height = heightCm != null ? Number(heightCm) : NaN;
  if (Number.isNaN(height) || height < 100 || height > 250) {
    return NextResponse.json(
      { error: 'Valid height (100–250 cm) is required' },
      { status: 400 }
    );
  }

  try {
    sessionStore.set(sessionId, { ...session, status: 'analyzing' });
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = await saveUpload(sessionId, buffer, file.type);

    const baseUrl = request.nextUrl.origin;
    const imageUrl = `${baseUrl}/api/files/${sessionId}/${filename}`;

    const pipelineResult = await runAnalysisPipeline({
      sessionId,
      imageUrl,
      imageBuffer: buffer,
      imageMime: file.type,
      heightCm: height,
      gender: gender || undefined,
    });

    if (!pipelineResult) {
      sessionStore.set(sessionId, {
        ...session,
        status: 'error',
        error: 'Analysis failed',
      });
      await deleteUpload(filename);
      return NextResponse.json(
        { error: 'Analysis failed. Please try another image.' },
        { status: 500 }
      );
    }

    const { model, sam3dFal, falHint } = pipelineResult;

    try {
      await archiveSam3dBody({
        modelId: model.id,
        sessionId,
        requestId: sam3dFal?.requestId,
        falData: sam3dFal?.falData,
        model,
      });
    } catch (archErr) {
      console.error('archiveSam3dBody:', archErr);
    }

    modelStore.set(model.id, model);
    sessionStore.set(sessionId, {
      ...session,
      modelId: model.id,
      status: 'ready',
    });
    await deleteUpload(filename);

    return NextResponse.json({
      model,
      status: 'ready',
      ...(falHint ? { falHint } : {}),
    });
  } catch (err) {
    console.error('Upload/analyze error:', err);
    sessionStore.set(sessionId, {
      ...session,
      status: 'error',
      error: err instanceof Error ? err.message : 'Analysis failed',
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
