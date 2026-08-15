import { catalogItems } from '@/data/catalog';
import { catalogStore, applyCatalogOverrides } from '@/lib/catalog-store';
import { listGarmentLibrary } from '@/lib/fal-archive';
import { garmentLibraryToCatalogItems } from '@/lib/fal-dresses-catalog';
import type { CatalogItem } from '@/types/catalog';

/**
 * Static catalog (usually empty) + optional merchant sync + fal-generated dress meshes.
 */
export async function getResolvedCatalog(merchantId?: string): Promise<CatalogItem[]> {
  const synced = merchantId ? catalogStore.get(merchantId) : [];
  const base = synced.length > 0 ? synced : catalogItems;
  const falDresses = garmentLibraryToCatalogItems(await listGarmentLibrary());
  return applyCatalogOverrides([...base, ...falDresses]);
}

export async function findCatalogItemById(productId: string, merchantId?: string): Promise<CatalogItem | undefined> {
  const items = await getResolvedCatalog(merchantId);
  return items.find((p) => p.id === productId || p.productId === productId);
}
