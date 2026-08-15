import type { CatalogItem } from '@/types/catalog';
import type { GarmentLibraryIndexEntry } from '@/types/library';

/** Card thumbnail when no product photo exists (fal mesh-only entries) */
export const FAL_DRESS_PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect fill="#1a1a1f" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#a78bfa" font-family="system-ui,sans-serif" font-size="13">fal dress</text></svg>`
  );

export function garmentLibraryEntryToCatalogItem(e: GarmentLibraryIndexEntry): CatalogItem {
  const short = e.id.replace(/^garment-/, '').slice(0, 8);
  return {
    id: e.id,
    name: `Generated dress (${short})`,
    description: '3D mesh from fal Rodin',
    category: 'dress',
    imageUrl: FAL_DRESS_PLACEHOLDER_IMAGE,
    modelUrl: e.modelUrl,
    sizes: [{ label: 'One size' }],
    tags: ['fal', 'generated'],
  };
}

export function garmentLibraryToCatalogItems(entries: GarmentLibraryIndexEntry[]): CatalogItem[] {
  return entries.map(garmentLibraryEntryToCatalogItem);
}
