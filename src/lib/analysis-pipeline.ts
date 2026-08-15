/**
 * Analysis pipeline: fal.ai SAM 3D Body + measurements (placeholder or AI Sizing)
 */

import { randomUUID } from 'crypto';
import type { VirtualHumanModel } from '@/types/body';

export interface AnalysisPipelineResult {
  model: VirtualHumanModel;
  /** Present when fal SAM 3D ran successfully enough to archive */
  sam3dFal?: {
    requestId?: string;
    falData: unknown;
  };
  /**
   * When set, fal did not produce a mesh (or was not called). Shown in API/UI so failures are not silent.
   */
  falHint?: string;
}

function falErrorToHint(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err) {
    const body = (err as { body?: { detail?: unknown } }).body?.detail;
    if (typeof body === 'string') return body.length > 280 ? `${body.slice(0, 280)}…` : body;
    if (Array.isArray(body) && body[0] && typeof body[0] === 'object' && 'msg' in body[0]) {
      return String((body[0] as { msg: string }).msg);
    }
  }
  if (err instanceof Error) {
    const m = err.message;
    if (m.length > 280) return `${m.slice(0, 280)}…`;
    return m;
  }
  return 'fal.ai request failed — see the server terminal for the full error.';
}

export interface PipelineInput {
  sessionId: string;
  /** Public URL of the image (used if imageBuffer not provided) */
  imageUrl?: string;
  /** Image bytes – when provided, sent to fal as base64 data URI so it works on localhost */
  imageBuffer?: Buffer;
  imageMime?: string;
  heightCm: number;
  gender?: string;
}

export async function runAnalysisPipeline(input: PipelineInput): Promise<AnalysisPipelineResult | null> {
  const { imageUrl, imageBuffer, imageMime, heightCm, gender } = input;
  const modelId = `model-${randomUUID()}`;

  let meshUrl: string | undefined;
  let proportions = getDefaultProportions();
  const metadata: { keypoints_3d?: number[][]; keypoints_2d?: number[][] } = {};
  let sam3dFal: AnalysisPipelineResult['sam3dFal'];

  // Prefer inline image so fal works on localhost (no public URL needed)
  const imageInput =
    imageBuffer && imageMime
      ? `data:${imageMime};base64,${imageBuffer.toString('base64')}`
      : imageUrl;

  let falHint: string | undefined;
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    falHint =
      'FAL_KEY is not set or is empty. Add FAL_KEY=your_key to .env in the project root, then restart `npm run dev`.';
  } else if (!imageInput) {
    falHint = 'No image data was sent to the analysis pipeline.';
  } else {
    try {
      const { fal } = await import('@fal-ai/client');
      fal.config({ credentials: falKey });
      const result = await fal.subscribe('fal-ai/sam-3/3d-body', {
        input: {
          image_url: imageInput,
          include_3d_keypoints: true,
          /** Required for `model_glb.url`; otherwise only keypoints load and the app shows a placeholder body */
          export_meshes: true,
        },
      });
      const data = result.data as {
        model_glb?: { url?: string };
        metadata?: { people?: Array<{ keypoints_3d?: number[][]; keypoints_2d?: number[][] }> };
      };
      if (data.model_glb?.url) meshUrl = data.model_glb.url;
      const person = data.metadata?.people?.[0];
      if (person?.keypoints_3d) metadata.keypoints_3d = person.keypoints_3d;
      if (person?.keypoints_2d) metadata.keypoints_2d = person.keypoints_2d;
      if (metadata.keypoints_3d) proportions = deriveProportionsFromKeypoints(metadata.keypoints_3d, heightCm);

      const requestId =
        result && typeof result === 'object' && 'requestId' in result
          ? String((result as { requestId?: string }).requestId)
          : undefined;
      sam3dFal = { requestId, falData: result.data };
      if (!meshUrl) {
        falHint =
          'fal.ai responded but did not return a body GLB (model_glb). Try another full-body photo, or check your fal.ai dashboard for errors or quota.';
      }
    } catch (err) {
      console.error('fal.ai SAM 3D error:', err);
      falHint = falErrorToHint(err);
    }
  }

  const measurements = await getMeasurements(heightCm, gender, process.env.AI_SIZING_API_KEY);

  const model: VirtualHumanModel = {
    id: modelId,
    createdAt: new Date().toISOString(),
    sourceType: 'image',
    face: {
      shape: 'oval',
      widthRatio: 0.65,
      heightRatio: 0.85,
      jawProminence: 0.5,
      cheekboneProminence: 0.5,
    },
    measurements,
    proportions,
    meshUrl,
  };
  return { model, sam3dFal, falHint: model.meshUrl ? undefined : falHint };
}

function getDefaultProportions() {
  return {
    headToBodyRatio: 1 / 7.5,
    torsoRatio: 0.35,
    legRatio: 0.47,
    armSpanToHeightRatio: 1.02,
    shoulderToHipRatio: 0.95,
  };
}

function deriveProportionsFromKeypoints(
  keypoints3d: number[][],
  heightCm: number
): VirtualHumanModel['proportions'] {
  if (!keypoints3d.length) return getDefaultProportions();
  const k = keypoints3d;
  const dist = (a: number[], b: number[]) =>
    Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  const y = (i: number) => k[i]?.[1] ?? 0;
  const torsoH = Math.abs(y(11) - y(23)) + Math.abs(y(12) - y(24)); // shoulder to hip approx
  const legH = Math.abs(y(23) - y(27)) + Math.abs(y(24) - y(28));
  const totalH = Math.max(1, torsoH + legH);
  return {
    headToBodyRatio: 1 / 7.5,
    torsoRatio: torsoH / totalH,
    legRatio: legH / totalH,
    armSpanToHeightRatio: 1.02,
    shoulderToHipRatio: 0.95,
  };
}

async function getMeasurements(
  heightCm: number,
  gender?: string,
  _aiSizingKey?: string
): Promise<VirtualHumanModel['measurements']> {
  // Placeholder: scale from height. In production call AI Sizing API with image + height + gender.
  const h = heightCm / 170;
  return {
    height: heightCm,
    shoulderWidth: Math.round(42 * h),
    chest: Math.round(92 * h),
    waist: Math.round(78 * h),
    hips: Math.round(96 * h),
    inseam: Math.round(78 * h),
    neck: Math.round(36 * h),
    arm: { length: Math.round(58 * h), circumference: Math.round(28 * h) },
    wrist: { length: 6, circumference: Math.round(16 * h) },
    thigh: { length: Math.round(42 * h), circumference: Math.round(54 * h) },
    calf: { length: Math.round(38 * h), circumference: Math.round(36 * h) },
  };
}
