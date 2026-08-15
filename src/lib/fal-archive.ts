/**
 * Persist fal.ai responses under storage/fal/ (gitignored with storage/)
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { VirtualHumanModel } from '@/types/body';
import type {
  BodyLibraryIndexEntry,
  GarmentLibraryIndexEntry,
  BodyArchiveFile,
  GarmentArchiveFile,
} from '@/types/library';
import {
  PRESET_BODY_LIBRARY_ENTRIES,
  getPresetBodyArchive,
} from '@/data/preset-body-library';

const ROOT = path.join(process.cwd(), 'storage', 'fal');
const BODIES_DIR = path.join(ROOT, 'bodies');
const GARMENTS_DIR = path.join(ROOT, 'garments');
const INDEX_DIR = path.join(ROOT, 'index');
const BODIES_INDEX = path.join(INDEX_DIR, 'bodies.json');
const GARMENTS_INDEX = path.join(INDEX_DIR, 'garments.json');

async function ensureDirs(): Promise<void> {
  await mkdir(BODIES_DIR, { recursive: true });
  await mkdir(GARMENTS_DIR, { recursive: true });
  await mkdir(INDEX_DIR, { recursive: true });
}

async function readBodiesIndex(): Promise<BodyLibraryIndexEntry[]> {
  try {
    const raw = await readFile(BODIES_INDEX, 'utf-8');
    return JSON.parse(raw) as BodyLibraryIndexEntry[];
  } catch {
    return [];
  }
}

async function writeBodiesIndex(entries: BodyLibraryIndexEntry[]): Promise<void> {
  await ensureDirs();
  await writeFile(BODIES_INDEX, JSON.stringify(entries, null, 2), 'utf-8');
}

async function readGarmentsIndex(): Promise<GarmentLibraryIndexEntry[]> {
  try {
    const raw = await readFile(GARMENTS_INDEX, 'utf-8');
    return JSON.parse(raw) as GarmentLibraryIndexEntry[];
  } catch {
    return [];
  }
}

async function writeGarmentsIndex(entries: GarmentLibraryIndexEntry[]): Promise<void> {
  await ensureDirs();
  await writeFile(GARMENTS_INDEX, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function archiveSam3dBody(params: {
  modelId: string;
  sessionId?: string;
  requestId?: string;
  falData?: unknown;
  model: VirtualHumanModel;
}): Promise<void> {
  await ensureDirs();
  const dir = path.join(BODIES_DIR, params.modelId);
  await mkdir(dir, { recursive: true });

  const archive: BodyArchiveFile = {
    endpoint: 'fal-ai/sam-3/3d-body',
    requestId: params.requestId,
    createdAt: new Date().toISOString(),
    sessionId: params.sessionId,
    ...(params.falData !== undefined ? { falData: params.falData } : {}),
    virtualHumanModel: params.model,
  };

  await writeFile(path.join(dir, 'response.json'), JSON.stringify(archive, null, 2), 'utf-8');

  const list = await readBodiesIndex();
  const entry: BodyLibraryIndexEntry = {
    id: params.modelId,
    createdAt: archive.createdAt,
    sessionId: params.sessionId,
    meshUrl: params.model.meshUrl,
    heightCm: params.model.measurements.height,
    hasMesh: Boolean(params.model.meshUrl),
  };
  const without = list.filter((e) => e.id !== entry.id);
  without.unshift(entry);
  await writeBodiesIndex(without);
}

export async function archiveRodinGarment(params: {
  requestId?: string;
  falData: unknown;
  modelUrl: string;
  seed?: number;
  catalogItemId?: string;
}): Promise<string> {
  await ensureDirs();
  const id = `garment-${randomUUID()}`;
  const dir = path.join(GARMENTS_DIR, id);
  await mkdir(dir, { recursive: true });

  const archive: GarmentArchiveFile = {
    endpoint: 'fal-ai/hyper3d/rodin/v2',
    requestId: params.requestId,
    createdAt: new Date().toISOString(),
    catalogItemId: params.catalogItemId,
    falData: params.falData,
    modelUrl: params.modelUrl,
    seed: params.seed,
  };

  await writeFile(path.join(dir, 'response.json'), JSON.stringify(archive, null, 2), 'utf-8');

  const list = await readGarmentsIndex();
  const entry: GarmentLibraryIndexEntry = {
    id,
    createdAt: archive.createdAt,
    modelUrl: params.modelUrl,
    seed: params.seed,
    catalogItemId: params.catalogItemId,
  };
  list.unshift(entry);
  await writeGarmentsIndex(list);

  return id;
}

export async function listBodyLibrary(): Promise<BodyLibraryIndexEntry[]> {
  const disk = await readBodiesIndex();
  const diskIds = new Set(disk.map((e) => e.id));
  const presets = PRESET_BODY_LIBRARY_ENTRIES.filter((e) => !diskIds.has(e.id));
  return [...presets, ...disk];
}

export async function listGarmentLibrary(): Promise<GarmentLibraryIndexEntry[]> {
  return readGarmentsIndex();
}

export async function readBodyArchive(modelId: string): Promise<BodyArchiveFile | null> {
  const preset = getPresetBodyArchive(modelId);
  if (preset) return preset;
  try {
    const p = path.join(BODIES_DIR, modelId, 'response.json');
    const raw = await readFile(p, 'utf-8');
    return JSON.parse(raw) as BodyArchiveFile;
  } catch {
    return null;
  }
}

export async function readGarmentArchive(garmentId: string): Promise<GarmentArchiveFile | null> {
  try {
    const p = path.join(GARMENTS_DIR, garmentId, 'response.json');
    const raw = await readFile(p, 'utf-8');
    return JSON.parse(raw) as GarmentArchiveFile;
  } catch {
    return null;
  }
}
