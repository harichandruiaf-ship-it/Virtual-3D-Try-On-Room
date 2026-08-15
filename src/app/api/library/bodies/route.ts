import { NextResponse } from 'next/server';
import { listBodyLibrary } from '@/lib/fal-archive';

export async function GET() {
  try {
    const items = await listBodyLibrary();
    return NextResponse.json({ items });
  } catch (err) {
    console.error('library bodies list:', err);
    return NextResponse.json({ error: 'Failed to list bodies' }, { status: 500 });
  }
}
