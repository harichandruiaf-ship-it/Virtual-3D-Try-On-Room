import type { CatalogItem } from '@/types/catalog';

/**
 * Default catalog is empty — dress items come from fal Rodin runs
 * (see `storage/fal/index/garments.json` → merged in `getResolvedCatalog`).
 * Merchant sync (`POST /api/catalog/sync`) can still supply a base list per merchant.
 */
export const catalogItems: CatalogItem[] = [];
