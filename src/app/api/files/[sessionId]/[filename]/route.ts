import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

/**
 * GET /api/files/[sessionId]/[filename] – Serve uploaded image for fal.ai (same-origin URL)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; filename: string }> }
) {
  const { sessionId, filename } = await params;
  if (!sessionId || !filename || filename.includes('..')) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
