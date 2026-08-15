import type { VirtualHumanModel } from '@/types/body';
import type { CatalogItem, SizeChartEntry } from '@/types/catalog';
import type { SizeRecommendation } from '@/types/session';

/**
 * Map user measurements to product size chart; return recommended size and fit score.
 */
export function getSizeRecommendation(
  model: VirtualHumanModel,
  product: CatalogItem
): SizeRecommendation | null {
  const chart = product.sizeChart;
  if (!chart?.length) {
    return { recommendedSize: product.sizes[0]?.label ?? 'M', measurementsUsed: [] };
  }
  const m = model.measurements;
  let bestSize: string = chart[0].size;
  let bestScore = -1;
  const used: string[] = [];

  for (const row of chart) {
    let score = 0;
    let count = 0;
    if (row.chest != null && m.chest != null) {
      score += 1 - Math.min(1, Math.abs(row.chest - m.chest) / 10);
      count++;
      if (!used.includes('chest')) used.push('chest');
    }
    if (row.waist != null && m.waist != null) {
      score += 1 - Math.min(1, Math.abs(row.waist - m.waist) / 10);
      count++;
      if (!used.includes('waist')) used.push('waist');
    }
    if (row.hips != null && m.hips != null) {
      score += 1 - Math.min(1, Math.abs(row.hips - m.hips) / 10);
      count++;
      if (!used.includes('hips')) used.push('hips');
    }
    if (row.inseam != null && m.inseam != null) {
      score += 1 - Math.min(1, Math.abs(row.inseam - m.inseam) / 5);
      count++;
      if (!used.includes('inseam')) used.push('inseam');
    }
    if (row.shoulder != null && m.shoulderWidth != null) {
      score += 1 - Math.min(1, Math.abs(row.shoulder - m.shoulderWidth) / 5);
      count++;
      if (!used.includes('shoulder')) used.push('shoulder');
    }
    const avg = count > 0 ? score / count : 0;
    if (avg > bestScore) {
      bestScore = avg;
      bestSize = row.size;
    }
  }

  const fitScore = Math.round(bestScore * 100);
  return {
    recommendedSize: bestSize,
    fitScore: fitScore > 0 ? fitScore : undefined,
    measurementsUsed: used,
  };
}
