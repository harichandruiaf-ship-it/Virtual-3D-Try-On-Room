/**
 * Virtual 3D Try-On Room – Clothing catalog types
 */

export type ClothingCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory'
  | 'full-body';

export interface SizeChartEntry {
  size: string;
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  shoulder?: number;
  sleeve?: number;
  [key: string]: string | number | undefined;
}

export interface ClothingSize {
  label: string;
  measurements?: Record<string, number>;
}

export interface CatalogItem {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  description?: string;
  category: ClothingCategory;
  brand?: string;
  imageUrl: string;
  modelUrl?: string;
  textureUrls?: Record<string, string>;
  sizes: ClothingSize[];
  sizeChart?: SizeChartEntry[];
  price?: number;
  currency?: string;
  tags?: string[];
}

export interface CatalogFilters {
  category?: ClothingCategory;
  tags?: string[];
  search?: string;
}
