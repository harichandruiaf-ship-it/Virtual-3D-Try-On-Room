/**
 * Virtual 3D Try-On Room – Body model types
 */

export interface FaceStructure {
  shape: string;
  widthRatio: number;
  heightRatio: number;
  jawProminence: number;
  cheekboneProminence: number;
  meshUrl?: string;
}

export interface LimbMeasurements {
  length: number;
  circumference: number;
  segments?: { length: number; circumference: number }[];
}

export interface BodyMeasurements {
  height: number;
  shoulderWidth: number;
  chest: number;
  waist: number;
  hips: number;
  inseam: number;
  neck: number;
  arm: LimbMeasurements;
  wrist: LimbMeasurements;
  thigh: LimbMeasurements;
  calf: LimbMeasurements;
  [key: string]: unknown;
}

export interface BodyProportions {
  headToBodyRatio: number;
  torsoRatio: number;
  legRatio: number;
  armSpanToHeightRatio: number;
  shoulderToHipRatio: number;
}

export interface PoseLandmarks {
  points: Array<{ x: number; y: number; z?: number }>;
  confidence?: number[];
}

export interface VirtualHumanModel {
  id: string;
  createdAt: string;
  sourceType: 'image' | 'video';
  face: FaceStructure;
  measurements: BodyMeasurements;
  proportions: BodyProportions;
  poseLandmarks?: PoseLandmarks;
  meshUrl?: string;
  parametricUrl?: string;
  thumbnailUrl?: string;
}
