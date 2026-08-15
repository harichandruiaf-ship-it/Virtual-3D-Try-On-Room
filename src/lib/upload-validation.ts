/**
 * Upload validation: type, size
 * Max 20 MB image, 50 MB video. Min 512 px on shortest side (client or server with sharp).
 *
 * TODO (implement later): Full image validation – min resolution (512px), aspect ratio,
 * content checks (e.g. person detected, full-body), file integrity, virus scan if storing.
 */

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MIN_DIMENSION = 512;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export function validateUpload(
  file: { type: string; size: number }
): { ok: true } | { ok: false; error: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { ok: false, error: 'File must be JPEG, PNG, WebP (image) or MP4, WebM (video)' };
  }

  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Image must be under 20 MB' };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: 'Video must be under 50 MB' };
  }

  return { ok: true };
}

export { MIN_DIMENSION, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES };
