/**
 * Session + model store. Persists to storage/session-store.json so dev restarts
 * don't drop sessions (in-memory alone caused "Session not found" after HMR/restart).
 * Swap for PostgreSQL + blob storage in production.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import type { VirtualHumanModel } from '@/types/body';
import type { TryOnSession } from '@/types/session';

const sessions = new Map<string, TryOnSession>();
const models = new Map<string, VirtualHumanModel>();

const STORE_DIR = path.join(process.cwd(), 'storage');
const STORE_FILE = path.join(STORE_DIR, 'session-store.json');

type PersistedShape = {
  sessions: Record<string, TryOnSession>;
  models: Record<string, VirtualHumanModel>;
};

function loadFromDisk(): void {
  try {
    if (!existsSync(STORE_FILE)) return;
    const raw = readFileSync(STORE_FILE, 'utf-8');
    const data = JSON.parse(raw) as PersistedShape;
    if (data.sessions && typeof data.sessions === 'object') {
      for (const [id, s] of Object.entries(data.sessions)) {
        sessions.set(id, s);
      }
    }
    if (data.models && typeof data.models === 'object') {
      for (const [id, m] of Object.entries(data.models)) {
        models.set(id, m);
      }
    }
  } catch (err) {
    console.warn('[storage] Could not load session-store.json:', err);
  }
}

function persistToDisk(): void {
  try {
    mkdirSync(STORE_DIR, { recursive: true });
    const payload: PersistedShape = {
      sessions: Object.fromEntries(sessions),
      models: Object.fromEntries(models),
    };
    writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[storage] Could not persist session store:', err);
  }
}

loadFromDisk();

export const sessionStore = {
  get(id: string): TryOnSession | undefined {
    return sessions.get(id);
  },
  set(id: string, session: TryOnSession): void {
    sessions.set(id, session);
    persistToDisk();
  },
  delete(id: string): boolean {
    const ok = sessions.delete(id);
    if (ok) persistToDisk();
    return ok;
  },
};

export const modelStore = {
  get(id: string): VirtualHumanModel | undefined {
    return models.get(id);
  },
  set(id: string, model: VirtualHumanModel): void {
    models.set(id, model);
    persistToDisk();
  },
  delete(id: string): boolean {
    const ok = models.delete(id);
    if (ok) persistToDisk();
    return ok;
  },
};
