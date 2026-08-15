'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Shirt } from 'lucide-react';
import type { BodyLibraryIndexEntry, GarmentLibraryIndexEntry } from '@/types/library';

export default function LibraryPage() {
  const [bodies, setBodies] = useState<BodyLibraryIndexEntry[]>([]);
  const [garments, setGarments] = useState<GarmentLibraryIndexEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/library/bodies').then((r) => r.json()),
      fetch('/api/library/garments').then((r) => r.json()),
    ])
      .then(([b, g]) => {
        if (cancelled) return;
        if (Array.isArray(b.items)) setBodies(b.items);
        if (Array.isArray(g.items)) setGarments(g.items);
      })
      .catch(() => {
        if (!cancelled) setErr('Could not load library.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-room-bg text-white">
      <header className="border-b border-room-border px-4 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-room-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </header>

      <div className="max-w-4xl mx-auto w-full p-6 space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Model library</h1>
          <p className="text-room-muted mt-2 text-sm">
            Saved bodies and garments from fal.ai runs (stored under <code className="text-room-accent">storage/fal</code>).
            Use them in the try-on room without calling the API again.
          </p>
        </div>

        {err && (
          <p className="text-red-400 text-sm">{err}</p>
        )}

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <User className="w-5 h-5" /> Bodies
          </h2>
          {bodies.length === 0 ? (
            <p className="text-room-muted text-sm">No saved bodies yet. Upload a photo on the upload page.</p>
          ) : (
            <ul className="space-y-2">
              {bodies.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-room-border bg-room-surface px-4 py-3"
                >
                  <div className="text-sm">
                    <span className="font-mono text-room-accent">{b.id}</span>
                    <span className="text-room-muted mx-2">·</span>
                    <span>{b.heightCm} cm</span>
                    {b.hasMesh ? (
                      <span className="text-green-400/90 ml-2">mesh</span>
                    ) : (
                      <span className="text-room-muted ml-2">placeholder</span>
                    )}
                  </div>
                  <Link
                    href={`/room?bodyId=${encodeURIComponent(b.id)}`}
                    className="text-sm px-3 py-1.5 rounded-lg bg-room-accent text-white hover:opacity-90"
                  >
                    Use in try-on
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Shirt className="w-5 h-5" /> Garments (Rodin)
          </h2>
          {garments.length === 0 ? (
            <p className="text-room-muted text-sm">
              No saved garments yet. Generate 3D from the{' '}
              <Link href="/admin/catalog-tools" className="text-room-accent hover:underline">
                catalog tools
              </Link>{' '}
              page.
            </p>
          ) : (
            <ul className="space-y-2">
              {garments.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-room-border bg-room-surface px-4 py-3"
                >
                  <div className="text-sm min-w-0 flex-1">
                    <span className="font-mono text-room-accent break-all">{g.id}</span>
                    {g.catalogItemId && (
                      <span className="text-room-muted block text-xs mt-1">
                        catalog: {g.catalogItemId}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/room?garmentId=${encodeURIComponent(g.id)}`}
                    className="text-sm px-3 py-1.5 rounded-lg border border-room-border text-room-muted hover:border-room-accent hover:text-white shrink-0"
                  >
                    Try on (dress)
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
