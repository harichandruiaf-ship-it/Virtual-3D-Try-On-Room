'use client';

import { useMemo, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Shirt, Info } from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { catalogItems as defaultCatalog } from '@/data/catalog';
import type { CatalogItem } from '@/types/catalog';
import { CatalogGrid } from '@/components/CatalogGrid';
import { ModelSummary } from '@/components/ModelSummary';
import { catalogItemFromLibraryGarment } from '@/lib/library-ui';

const Scene = dynamic(
  () => import('@/components/Scene').then((m) => ({ default: m.Scene })),
  {
    ssr: false,
    loading: () => (
      <div className="canvas-container w-full h-full flex items-center justify-center text-room-muted">
        Loading 3D…
      </div>
    ),
  }
);

function RoomPageInner() {
  const searchParams = useSearchParams();
  const { humanModel, wornItems, setHumanModel, setWornItem, falNotice, setFalNotice } =
    useRoomStore();

  useEffect(() => {
    const bodyId = searchParams.get('bodyId');
    const garmentId = searchParams.get('garmentId');
    if (!bodyId && !garmentId) return;

    const ac = new AbortController();
    (async () => {
      if (bodyId) {
        const r = await fetch(`/api/library/bodies/${encodeURIComponent(bodyId)}`, {
          signal: ac.signal,
        });
        const d = await r.json();
        if (r.ok && d.model) setHumanModel(d.model);
      }
      if (garmentId) {
        const r = await fetch(`/api/library/garments/${encodeURIComponent(garmentId)}`, {
          signal: ac.signal,
        });
        const d = await r.json();
        if (r.ok && d.modelUrl) {
          setWornItem('dress', catalogItemFromLibraryGarment(garmentId, d.modelUrl));
        }
      }
    })().catch(() => {});

    return () => ac.abort();
  }, [searchParams, setHumanModel, setWornItem]);
  const [catalog, setCatalog] = useState<CatalogItem[]>(defaultCatalog);

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items) && d.items.length > 0) setCatalog(d.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    useRoomStore.setState((s) => {
      const next: Record<string, CatalogItem> = { ...s.wornItems };
      let changed = false;
      for (const [slot, item] of Object.entries(s.wornItems)) {
        const fresh = catalog.find((c) => c.id === item.id);
        if (fresh && fresh.modelUrl !== item.modelUrl) {
          next[slot] = fresh;
          changed = true;
        }
      }
      return changed ? { wornItems: next } : {};
    });
  }, [catalog]);

  const heightScale = useMemo(() => {
    if (!humanModel?.measurements?.height) return 1;
    return humanModel.measurements.height / 170;
  }, [humanModel]);

  return (
    <main className="min-h-screen flex flex-col bg-room-bg">
      <header className="border-b border-room-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-room-muted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Virtual Try-On Room
          </Link>
          <Link href="/library" className="text-xs text-room-muted hover:text-room-accent">
            Library
          </Link>
        </div>
        {humanModel && <ModelSummary model={humanModel} />}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 min-h-0">
        <section className="lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="rounded-2xl overflow-hidden border border-room-border flex-1 min-h-[400px]">
            <Scene
              meshUrl={humanModel?.meshUrl}
              heightScale={heightScale}
              wornItems={wornItems}
            />
          </div>
          {humanModel && !humanModel.meshUrl && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-2">
                {falNotice ? (
                  <p className="text-amber-200 text-sm whitespace-pre-wrap">{falNotice}</p>
                ) : (
                  <p className="text-amber-200 text-sm">
                    You&apos;re seeing a placeholder body. To get a <strong>realistic 3D model</strong> from your
                    photo, add your fal.ai API key: create a <code className="bg-black/20 px-1 rounded">.env</code>{' '}
                    file with <code className="bg-black/20 px-1 rounded">FAL_KEY=your_key</code>, restart the app, then
                    upload again. Check the terminal running <code className="bg-black/20 px-1 rounded">npm run dev</code>{' '}
                    for fal.ai errors.
                  </p>
                )}
                {falNotice && (
                  <button
                    type="button"
                    onClick={() => setFalNotice(null)}
                    className="text-xs text-amber-400/90 hover:text-amber-300 underline"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
          {!humanModel && (
            <div className="mt-4 p-4 rounded-xl bg-room-surface border border-room-border flex items-center gap-3">
              <Info className="w-5 h-5 text-room-accent shrink-0" />
              <p className="text-room-muted text-sm">
                Create your 3D model from a photo on the{' '}
                <Link href="/upload" className="text-room-accent hover:underline">
                  upload page
                </Link>
                . Then come back to try on clothes. Until then, you see a default
                body.
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col min-h-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
            <Shirt className="w-5 h-5" /> Catalog
          </h2>
          <div className="flex-1 overflow-auto rounded-xl border border-room-border bg-room-surface p-3">
            <CatalogGrid items={catalog} wornItems={wornItems} humanModel={humanModel} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-room-bg text-room-muted">
          Loading room…
        </main>
      }
    >
      <RoomPageInner />
    </Suspense>
  );
}
