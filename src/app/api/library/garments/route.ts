import { NextResponse } from 'next/server';
import { listGarmentLibrary } from '@/lib/fal-archive';

export async function GET() {
  try {
    const items = await listGarmentLibrary();
    return NextResponse.json({ items });
  } catch (err) {
    console.error('library garments list:', err);
    return NextResponse.json({ error: 'Failed to list garments' }, { status: 500 });
  }
}
