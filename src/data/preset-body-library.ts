/**
 * Bodies bundled with the app (no fal API call). GLB lives under public/fal-library/.
 * Imported from fal playground share: sam-3/3d-body?share=02560214-d498-4de9-891e-c9ee96a1325e
 */

import type { VirtualHumanModel } from '@/types/body';
import type { BodyArchiveFile, BodyLibraryIndexEntry } from '@/types/library';

export const PRESET_SAM3D_SHARE_BODY_ID = 'preset-sam3d-02560214';

const MESH_PATH = '/fal-library/bodies/sam3d-02560214/combined_bodies.glb';

const virtualHumanModel: VirtualHumanModel = {
  id: PRESET_SAM3D_SHARE_BODY_ID,
  createdAt: '2026-04-20T12:00:00.000Z',
  sourceType: 'image',
  face: {
    shape: 'oval',
    widthRatio: 0.65,
    heightRatio: 0.85,
    jawProminence: 0.5,
    cheekboneProminence: 0.5,
  },
  measurements: {
    height: 170,
    shoulderWidth: 42,
    chest: 92,
    waist: 78,
    hips: 96,
    inseam: 78,
    neck: 36,
    arm: { length: 58, circumference: 28 },
    wrist: { length: 6, circumference: 16 },
    thigh: { length: 42, circumference: 54 },
    calf: { length: 38, circumference: 36 },
  },
  proportions: {
    headToBodyRatio: 1 / 7.5,
    torsoRatio: 0.35,
    legRatio: 0.47,
    armSpanToHeightRatio: 1.02,
    shoulderToHipRatio: 0.95,
  },
  meshUrl: MESH_PATH,
};

const presetArchive: BodyArchiveFile = {
  endpoint: 'fal-ai/sam-3/3d-body',
  createdAt: virtualHumanModel.createdAt,
  falData: {
    _bundled: true,
    falPlaygroundShare: '02560214-d498-4de9-891e-c9ee96a1325e',
    modelPage: 'https://fal.ai/models/fal-ai/sam-3/3d-body?share=02560214-d498-4de9-891e-c9ee96a1325e',
  },
  virtualHumanModel,
};

export const PRESET_BODY_LIBRARY_ENTRIES: BodyLibraryIndexEntry[] = [
  {
    id: PRESET_SAM3D_SHARE_BODY_ID,
    createdAt: presetArchive.createdAt,
    meshUrl: MESH_PATH,
    heightCm: 170,
    hasMesh: true,
  },
];

export function getPresetBodyArchive(modelId: string): BodyArchiveFile | null {
  return modelId === PRESET_SAM3D_SHARE_BODY_ID ? presetArchive : null;
}
