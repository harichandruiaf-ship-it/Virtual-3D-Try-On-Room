'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogItem } from '@/types/catalog';

/**
 * Dev/admin: generate dress GLB via fal Rodin v2 — each success is saved and listed in the dress catalog.
 */
export default function CatalogToolsPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const loadCatalog = useCallback(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a dress/product image');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    setLastUrl(null);
    try {
      const form = new FormData();
      form.append('file', file);
      if (catalogItemId) form.append('catalogItemId', catalogItemId);
      const res = await fetch('/api/catalog/generate-3d', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setLastUrl(data.modelUrl);
      setMessage(
        catalogItemId
          ? `Updated item "${catalogItemId}" with this mesh. Also saved under fal library.`
          : `Dress added to catalog (id: ${data.garmentId ?? 'saved'}). Open the try-on room to try it on.`
      );
      loadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-room-bg p-8 text-white max-w-2xl mx-auto">
      <Link href="/" className="text-room-muted hover:text-room-accent text-sm">
        ← Home
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">Catalog 3D (fal Rodin)</h1>
      <p className="text-room-muted text-sm mb-6">
        Each successful run is stored under <code className="bg-room-surface px-1 rounded">storage/fal</code> and
        appears in the <strong>dress catalog</strong> (try-on room). Upload a <strong>dress or product</strong> photo
        (not a person). Requires{' '}
        <code className="bg-room-surface px-1 rounded">FAL_KEY</code> in <code className="bg-room-surface px-1 rounded">.env</code>.
        Each run bills fal separately from SAM 3D Body. If you see a billing or balance error, add credits at{' '}
        <a
          href="https://fal.ai/dashboard/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-room-accent underline"
        >
          fal.ai/dashboard/billing
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-room-muted mb-1">
            Patch existing item id (optional — merchant sync / advanced)
          </label>
          <select
            value={catalogItemId}
            onChange={(e) => setCatalogItemId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-room-surface border border-room-border"
          >
            <option value="">— New dress entry (default) —</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.category})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-room-muted mb-1">Product image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 rounded-lg bg-room-accent text-white disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate 3D mesh'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      {message && <p className="mt-4 text-room-muted text-sm">{message}</p>}
      {lastUrl && (
        <p className="mt-2 text-xs break-all text-room-accent">
          <span className="text-room-muted">modelUrl: </span>
          {lastUrl}
        </p>
      )}

      <div className="mt-10 border-t border-room-border pt-6">
        <h2 className="font-semibold mb-2">Current catalog (with overrides)</h2>
        <ul className="text-sm text-room-muted space-y-1">
          {items.map((i) => (
            <li key={i.id}>
              {i.name}: {i.modelUrl ? <span className="text-green-400">has GLB</span> : 'procedural only'}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
