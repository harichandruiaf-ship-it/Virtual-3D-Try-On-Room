import type { ClothingCategory } from '@/types/catalog';

/**
 * v1: Rough placement of garment GLB on the avatar (same coordinate system as HumanAvatar / SAM body).
 * Tune per category; Rodin meshes are often Y-up with arbitrary origin.
 */
export function getCategoryGarmentTransform(
  category: ClothingCategory,
  heightScale: number
): {
  position: [number, number, number];
  scale: number;
} {
  const s = heightScale;
  switch (category) {
    case 'dress':
      return { position: [0, 0.88 * s, 0.02 * s], scale: 0.42 * s };
    case 'top':
      return { position: [0, 1.08 * s, 0.02 * s], scale: 0.4 * s };
    case 'outerwear':
      return { position: [0, 1.1 * s, 0.03 * s], scale: 0.44 * s };
    case 'bottom':
      return { position: [0, 0.42 * s, 0.02 * s], scale: 0.38 * s };
    case 'full-body':
      return { position: [0, 0.95 * s, 0.02 * s], scale: 0.45 * s };
    case 'shoes':
      return { position: [0, 0.05 * s, 0.1 * s], scale: 0.25 * s };
    case 'accessory':
    default:
      return { position: [0, 1.35 * s, 0.08 * s], scale: 0.2 * s };
  }
}
