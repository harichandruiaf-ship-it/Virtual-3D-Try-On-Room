import type { CatalogItem } from '@/types/catalog';

const byMerchant = new Map<string, CatalogItem[]>();

/** Server-side patches by catalog item id (e.g. modelUrl from Rodin) */
const itemOverrides = new Map<string, Partial<CatalogItem>>();

export function setCatalogOverride(itemId: string, patch: Partial<CatalogItem>): void {
  itemOverrides.set(itemId, { ...itemOverrides.get(itemId), ...patch });
}

export function applyCatalogOverrides(items: CatalogItem[]): CatalogItem[] {
  return items.map((i) => {
    const o = itemOverrides.get(i.id);
    return o ? { ...i, ...o } : i;
  });
}

export const catalogStore = {
  get(merchantId?: string): CatalogItem[] {
    if (merchantId) return byMerchant.get(merchantId) ?? [];
    return Array.from(byMerchant.values()).flat();
  },
  set(merchantId: string, items: CatalogItem[]): void {
    byMerchant.set(merchantId, items);
  },
  merge(merchantId: string, items: CatalogItem[]): void {
    const existing = byMerchant.get(merchantId) ?? [];
    const byId = new Map(existing.map((i) => [i.id, i]));
    items.forEach((i) => byId.set(i.id, i));
    byMerchant.set(merchantId, Array.from(byId.values()));
  },
};
