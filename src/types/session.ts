/**
 * Session and API types for headless integration
 */

export interface TryOnSession {
  id: string;
  createdAt: string;
  merchantId?: string;
  productId?: string;
  variantId?: string;
  modelId: string | null;
  status: 'pending_upload' | 'analyzing' | 'ready' | 'error';
  error?: string;
}

export interface SizeRecommendation {
  recommendedSize: string;
  fitScore?: number;
  variantId?: string;
  measurementsUsed: string[];
}
