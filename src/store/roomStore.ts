import { create } from 'zustand';
import type { VirtualHumanModel } from '@/types/body';
import type { CatalogItem } from '@/types/catalog';

interface RoomState {
  humanModel: VirtualHumanModel | null;
  setHumanModel: (model: VirtualHumanModel | null) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  wornItems: Record<string, CatalogItem>;
  setWornItem: (slot: string, item: CatalogItem | null) => void;
  clearOutfit: () => void;
  isAnalyzing: boolean;
  setAnalyzing: (v: boolean) => void;
  analysisError: string | null;
  setAnalysisError: (e: string | null) => void;
  /** Shown on try-on room after upload when fal did not return a mesh (or API message) */
  falNotice: string | null;
  setFalNotice: (msg: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  humanModel: null,
  setHumanModel: (humanModel) => set({ humanModel }),
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  wornItems: {},
  setWornItem: (slot, item) =>
    set((s) => ({
      wornItems: item
        ? { ...s.wornItems, [slot]: item }
        : (() => {
            const next = { ...s.wornItems };
            delete next[slot];
            return next;
          })(),
    })),
  clearOutfit: () => set({ wornItems: {} }),
  isAnalyzing: false,
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  analysisError: null,
  setAnalysisError: (analysisError) => set({ analysisError }),
  falNotice: null,
  setFalNotice: (falNotice) => set({ falNotice }),
}));
