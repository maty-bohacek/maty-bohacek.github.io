import 'server-only';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';
import type { MediaType } from '@prisma/client';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  VIDEO_AUDIO_BITRATE,
  VIDEO_CRF,
  VIDEO_MAX_DIM,
} from './constants';

const execFileAsync = promisify(execFile);

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

/** Resolve the bundled ffmpeg binary path (ffmpeg-static), or null if absent. */
async function ffmpegBinary(): Promise<string | null> {
  try {
    const mod = await import('ffmpeg-static');
    // ffmpeg-static's default export is the absolute path to the binary.
    const p = (mod.default ?? mod) as unknown as string | null;
    return typeof p === 'string' && p.length > 0 ? p : null;
  } catch {
    return null;
  }
}

/**
 * Transcode an uploaded video to a compact, metadata-free mp4 (H.264/AAC).
 *  - `-map_metadata -1` strips ALL container/stream metadata, including GPS and
 *    device tags that could deanonymize the uploader.
 *  - The long edge is capped at VIDEO_MAX_DIM and quality set by VIDEO_CRF to
 *    keep stored files small.
 * Returns the compressed buffer, or `null` if ffmpeg is unavailable or fails —
 * callers fall back to storing the original in that case.
 */
async function compressVideo(buffer: Buffer): Promise<Buffer | null> {
  const bin = await ffmpegBinary();
  if (!bin) {
    console.warn('[media] ffmpeg not available — storing video without transcoding.');
    return null;
  }

  let dir: string | null = null;
  try {
    dir = await mkdtemp(path.join(os.tmpdir(), 'slop-video-'));
    const inPath = path.join(dir, 'input');
    const outPath = path.join(dir, 'output.mp4');
    await writeFile(inPath, buffer);

    // Downscale only if larger than the cap; keep aspect and force even dims
    // (required by yuv420p / H.264). The min() trick avoids upscaling.
    const scale = `scale='if(gt(iw,ih),min(${VIDEO_MAX_DIM},iw),-2)':'if(gt(iw,ih),-2,min(${VIDEO_MAX_DIM},ih))'`;

    await execFileAsync(
      bin,
      [
        '-y',
        '-i', inPath,
        '-map_metadata', '-1', // strip all metadata (GPS, device, timestamps…)
        '-map', '0:v:0', // first video stream
        '-map', '0:a:0?', // first audio stream if present
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', String(VIDEO_CRF),
        '-vf', scale,
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', VIDEO_AUDIO_BITRATE,
        '-movflags', '+faststart',
        outPath,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    );

    return await readFile(outPath);
  } catch (err) {
    console.error('[media] video transcoding failed:', err);
    return null;
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Normalize an uploaded file for storage.
 *  - Images are auto-oriented, downscaled, and re-encoded to WebP. This also
 *    strips all original metadata (incl. EXIF GPS) for privacy, and neutralizes
 *    any polyglot/embedded payloads. A small thumbnail is produced for the map.
 *  - Videos are transcoded to a compact H.264/AAC mp4 with ALL metadata stripped
 *    (incl. GPS/device tags). If ffmpeg is unavailable the original is kept.
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
    const compressed = await compressVideo(buffer);
    if (compressed) {
      return {
        mediaType: 'VIDEO',
        mainBuffer: compressed,
        mainExt: 'mp4',
        mainMime: 'video/mp4',
      };
    }
    // Fallback: store the original (e.g. ffmpeg missing). Note this path does
    // NOT strip metadata — it only triggers when transcoding can't run.
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
