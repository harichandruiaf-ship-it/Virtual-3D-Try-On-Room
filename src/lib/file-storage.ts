/**
 * Local file storage for uploads (swap for S3/R2 in production)
 */

import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

export async function saveUpload(sessionId: string, buffer: Buffer, mime: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const filename = `${sessionId}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);
  return filename;
}

export async function readUpload(filename: string): Promise<Buffer | null> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    return await readFile(filepath);
  } catch {
    return null;
  }
}

export async function getUploadPath(filename: string): Promise<string | null> {
  const pathModule = await import('path');
  const fs = await import('fs/promises');
  const filepath = pathModule.join(UPLOAD_DIR, filename);
  try {
    await fs.access(filepath);
    return filepath;
  } catch {
    return null;
  }
}

export async function deleteUpload(filename: string): Promise<void> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await unlink(filepath);
  } catch {
    // ignore
  }
}
