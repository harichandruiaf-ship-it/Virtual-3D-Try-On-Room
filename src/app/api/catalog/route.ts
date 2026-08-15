import { NextRequest, NextResponse } from 'next/server';
import { getResolvedCatalog } from '@/lib/catalog-resolve';

/**
 * GET /api/catalog?merchant_id=... – Dress meshes from fal Rodin + optional merchant sync + overrides
 */
export async function GET(request: NextRequest) {
  const merchantId = request.nextUrl.searchParams.get('merchant_id') ?? undefined;
  const items = await getResolvedCatalog(merchantId);
  return NextResponse.json({ items });
}
