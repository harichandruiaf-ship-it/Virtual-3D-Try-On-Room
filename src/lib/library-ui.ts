import type { CatalogItem } from '@/types/catalog';

/** Placeholder card image for library-sourced garment meshes */
export const LIBRARY_GARMENT_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect fill="#1a1a1f" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="system-ui,sans-serif" font-size="14">Saved garment</text></svg>`
  );

export function catalogItemFromLibraryGarment(garmentId: string, modelUrl: string): CatalogItem {
  return {
    id: `library-garment-${garmentId}`,
    name: 'Saved garment',
    category: 'dress',
    imageUrl: LIBRARY_GARMENT_IMAGE,
    modelUrl,
    sizes: [{ label: 'One size' }],
  };
}
