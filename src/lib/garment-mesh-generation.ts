/**
 * fal.ai Hyper3D Rodin v2 – image-to-3D garment/product mesh (GLB).
 * Abstraction so the endpoint id can be swapped (e.g. Tripo3D) later.
 */

const RODIN_ENDPOINT = 'fal-ai/hyper3d/rodin/v2' as const;

export interface GarmentMeshResult {
  modelUrl: string;
  seed?: number;
  requestId?: string;
  /** Full fal subscribe `data` for archiving */
  falData: unknown;
}

export async function generateGarmentMeshFromImage(
  imageBuffer: Buffer,
  imageMime: string,
  options?: { prompt?: string }
): Promise<GarmentMeshResult> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error('FAL_KEY is not configured');
  }

  const dataUri = `data:${imageMime};base64,${imageBuffer.toString('base64')}`;

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = await fal.subscribe(RODIN_ENDPOINT, {
    input: {
      prompt: options?.prompt ?? '',
      input_image_urls: [dataUri],
      geometry_file_format: 'glb',
      material: 'All',
      quality_mesh_option: '20K Triangle',
    },
  });

  const data = result.data as {
    model_mesh?: { url?: string };
    seed?: number;
  };

  const url = data.model_mesh?.url;
  if (!url) {
    throw new Error('Rodin did not return model_mesh.url');
  }

  const requestId =
    result && typeof result === 'object' && 'requestId' in result
      ? String((result as { requestId?: string }).requestId)
      : undefined;

  return {
    modelUrl: url,
    seed: data.seed,
    requestId,
    falData: result.data,
  };
}
