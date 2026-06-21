import 'server-only';
import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Root of persistent storage. On Railway, attach a Volume mounted at /data and
// set DATA_DIR=/data. Locally it falls back to ./data (gitignored).
export function dataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), 'data');
}

export function uploadsDir(): string {
  return path.join(dataDir(), 'uploads');
}

/**
 * Build a date-sharded, collision-free relative key for a new file, e.g.
 * "2026/06/ab12...e9.jpg". Returned path uses POSIX separators so it round-trips
 * cleanly through the database and URLs.
 */
export function newMediaKey(ext: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const clean = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
  return `${yyyy}/${mm}/${randomUUID()}.${clean}`;
}

/** Resolve a stored relative key to an absolute path, blocking path traversal. */
export function resolveUpload(relKey: string): string | null {
  const base = uploadsDir();
  const resolved = path.resolve(base, relKey);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    return null; // escaped the uploads directory
  }
  return resolved;
}

export async function saveUpload(relKey: string, data: Buffer): Promise<void> {
  const abs = resolveUpload(relKey);
  if (!abs) throw new Error('Invalid media key.');
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, data);
}

export async function uploadStat(relKey: string): Promise<{ size: number } | null> {
  const abs = resolveUpload(relKey);
  if (!abs) return null;
  try {
    const s = await stat(abs);
    return s.isFile() ? { size: s.size } : null;
  } catch {
    return null;
  }
}

/** Create a Node read stream for a stored file, optionally a byte range. */
export function uploadReadStream(relKey: string, start?: number, end?: number) {
  const abs = resolveUpload(relKey);
  if (!abs) throw new Error('Invalid media key.');
  return createReadStream(abs, start !== undefined ? { start, end } : undefined);
}
