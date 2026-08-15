import { NextRequest, NextResponse } from 'next/server';
import { modelStore } from '@/lib/storage';
import { findCatalogItemById } from '@/lib/catalog-resolve';
import { getSizeRecommendation } from '@/lib/size-recommendation';

/**
 * GET /api/products/[id]/size-recommendation?model_id=xxx – Headless size recommendation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const modelId = request.nextUrl.searchParams.get('model_id');
  if (!modelId) {
    return NextResponse.json(
      { error: 'model_id query parameter required' },
      { status: 400 }
    );
  }
  const model = modelStore.get(modelId);
  if (!model) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  }
  const product = await findCatalogItemById(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const recommendation = getSizeRecommendation(model, product);
  return NextResponse.json(recommendation);
}
