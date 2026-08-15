'use client';

import type { CatalogItem } from '@/types/catalog';
import type { VirtualHumanModel } from '@/types/body';
import { useRoomStore } from '@/store/roomStore';
import { getSizeRecommendation } from '@/lib/size-recommendation';

export function CatalogGrid({
  items,
  wornItems,
  humanModel,
}: {
  items: CatalogItem[];
  wornItems: Record<string, CatalogItem>;
  humanModel?: VirtualHumanModel | null;
}) {
  const { setWornItem } = useRoomStore();

  const slotForCategory = (category: CatalogItem['category']): string => {
    const map: Record<string, string> = {
      top: 'top',
      bottom: 'bottom',
      dress: 'dress',
      outerwear: 'outerwear',
      shoes: 'shoes',
      accessory: 'accessory',
      'full-body': 'full-body',
    };
    return map[category] ?? category;
  };

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const slot = slotForCategory(item.category);
        const isWorn = wornItems[slot]?.id === item.id;
        const recommendation = humanModel ? getSizeRecommendation(humanModel, item) : null;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setWornItem(slot, isWorn ? null : item)}
              className={`catalog-card w-full rounded-xl border p-3 text-left transition ${
                isWorn
                  ? 'border-room-accent bg-room-accent/10'
                  : 'border-room-border bg-room-bg hover:border-room-muted'
              }`}
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-room-surface mb-2">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-medium text-white truncate">{item.name}</p>
              <p className="text-room-muted text-xs truncate">
                {item.category} {item.price != null && `· $${item.price}`}
              </p>
              {recommendation?.recommendedSize && (
                <p className="text-xs text-room-accent mt-0.5">
                  Recommended size: {recommendation.recommendedSize}
                  {recommendation.fitScore != null && ` (${recommendation.fitScore}% fit)`}
                </p>
              )}
              <p className="text-xs mt-1 text-room-muted">
                {isWorn ? 'Worn · Click to remove' : 'Click to try on'}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
