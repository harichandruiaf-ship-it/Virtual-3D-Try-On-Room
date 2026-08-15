import { NextRequest, NextResponse } from 'next/server';
import { catalogStore } from '@/lib/catalog-store';
import type { CatalogItem } from '@/types/catalog';

/**
 * POST /api/catalog/sync – Sync products from merchant (headless / Shopify etc.)
 * Body: { merchantId: string, products: CatalogItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const merchantId = body.merchantId;
    const products = body.products as CatalogItem[] | undefined;
    if (!merchantId || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'merchantId and products array required' },
        { status: 400 }
      );
    }
    catalogStore.merge(merchantId, products);
    return NextResponse.json({ ok: true, count: products.length });
  } catch (err) {
    console.error('Catalog sync error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
