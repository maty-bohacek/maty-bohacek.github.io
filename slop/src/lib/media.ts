import 'server-only';
import sharp from 'sharp';
import type { MediaType } from '@prisma/client';
import { ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES } from './constants';

export type ProcessedUpload = {
  mediaType: MediaType;
  mainBuffer: Buffer;
  mainExt: string;
  mainMime: string;
  thumbBuffer?: Buffer;
  thumbExt?: string;
  width?: number;
  height?: number;
};

const VIDEO_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

const MAIN_MAX_DIM = 2000; // cap the long edge to keep storage reasonable
const THUMB_WIDTH = 600;

function isImage(mime: string): boolean {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}

function isVideo(mime: string): boolean {
  return (ALLOWED_VIDEO_MIMES as readonly string[]).includes(mime);
}

/**
 * Normalize an uploaded file for storage.
 *  - Images are auto-oriented, downscaled, and re-encoded to WebP. This also
 *    strips all original metadata (incl. EXIF GPS) for privacy, and neutralizes
 *    any polyglot/embedded payloads. A small thumbnail is produced for the map.
 *  - Videos are validated and stored as-is (no server-side transcoding).
 */
export async function processUpload(buffer: Buffer, mime: string): Promise<ProcessedUpload> {
  if (isImage(mime)) {
    const animated = mime === 'image/gif';
    const pipeline = sharp(buffer, { animated, failOn: 'none' }).rotate();
    const meta = await pipeline.metadata();

    const main = await sharp(buffer, { animated, failOn: 'none' })
      .rotate()
      .resize({
        width: MAIN_MAX_DIM,
        height: MAIN_MAX_DIM,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const thumb = await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();

    // For animated GIFs, sharp reports the full sprite-sheet height; prefer the
    // page height when available so stored dimensions match a single frame.
    const width = main.info.width;
    const pageHeight = (meta as { pageHeight?: number }).pageHeight;
    const height = animated && pageHeight ? pageHeight : main.info.height;

    return {
      mediaType: 'IMAGE',
      mainBuffer: main.data,
      mainExt: 'webp',
      mainMime: 'image/webp',
      thumbBuffer: thumb,
      thumbExt: 'webp',
      width,
      height,
    };
  }

  if (isVideo(mime)) {
    return {
      mediaType: 'VIDEO',
      mainBuffer: buffer,
      mainExt: VIDEO_EXT[mime] ?? 'mp4',
      mainMime: mime,
    };
  }

  throw new Error('Unsupported media type.');
}

/** Best-effort content type for serving a stored file by extension. */
export function contentTypeForExt(ext: string): string {
  const e = ext.toLowerCase();
  const map: Record<string, string> = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    avif: 'image/avif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  return map[e] ?? 'application/octet-stream';
}
