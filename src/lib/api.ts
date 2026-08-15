import type { VirtualHumanModel } from '@/types/body';

export async function createSession(options?: {
  merchantId?: string;
  productId?: string;
  variantId?: string;
}): Promise<{ sessionId: string; status: string }> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options ?? {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Failed to create session');
  }
  return res.json();
}

export async function uploadAndAnalyze(
  sessionId: string,
  file: File,
  heightCm: number,
  gender?: string
): Promise<{ model: VirtualHumanModel; status: string; falHint?: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('heightCm', String(heightCm));
  if (gender) form.append('gender', gender);
  const res = await fetch(`/api/sessions/${sessionId}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Analysis failed');
  }
  return res.json();
}
