/**
 * Persisted fal.ai generations (filesystem indexes)
 */

import type { VirtualHumanModel } from './body';

export interface BodyLibraryIndexEntry {
  id: string;
  createdAt: string;
  sessionId?: string;
  meshUrl?: string;
  heightCm: number;
  /** True if SAM 3D returned a mesh */
  hasMesh: boolean;
}

export interface GarmentLibraryIndexEntry {
  id: string;
  createdAt: string;
  modelUrl: string;
  seed?: number;
  catalogItemId?: string;
}

export interface BodyArchiveFile {
  endpoint: 'fal-ai/sam-3/3d-body';
  requestId?: string;
  createdAt: string;
  sessionId?: string;
  /** Full fal `result.data` when SAM 3D ran */
  falData?: unknown;
  /** App model snapshot for reload without re-running pipeline */
  virtualHumanModel: VirtualHumanModel;
}

export interface GarmentArchiveFile {
  endpoint: 'fal-ai/hyper3d/rodin/v2';
  requestId?: string;
  createdAt: string;
  catalogItemId?: string;
  falData: unknown;
  modelUrl: string;
  seed?: number;
}
