// Download and validate a still image from Reddit. The app re-encodes and caps
// dimensions on its side, but we do light client-side checks so we never try to
// submit something the app will reject (unsupported type / too large).

import type { FetchedImage } from './types.js';

// The app accepts JPEG/PNG/WebP/GIF/AVIF, but the enrichment step sends the
// image to Claude vision first, which reliably handles only these four. Sticking
// to them means we never fetch something we can't enrich. (MAX_IMAGE_BYTES
// mirrors slop/src/lib/constants.ts.)
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 12 * 1024 * 1024;

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function fetchImage(url: string, userAgent: string): Promise<FetchedImage | null> {
  const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
  if (!res.ok) return null;

  let mime = (res.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  // Some hosts serve octet-stream; fall back to the extension.
  if (!ALLOWED.has(mime)) {
    const ext = url.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
    mime = EXT_TO_MIME[ext] ?? mime;
  }
  if (!ALLOWED.has(mime)) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return null;

  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
  return { buffer, mime, filename: `reddit.${ext}` };
}
