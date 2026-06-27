import { existsSync } from 'node:fs';
import { PassThrough, Readable } from 'node:stream';
import archiver from 'archiver';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canManageUsers } from '@/lib/roles';
import { resolveUpload } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Full database backup as a streamed ZIP — super admin only. Contains:
 *   - `database.json`: every row of every table (users + submissions), enough to
 *     restore the database. Includes password hashes (not plaintext) by design.
 *   - `uploads/…`: the stored media + thumbnails referenced by submissions, so
 *     the archive is a complete, self-contained snapshot of all the data.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return new Response('Not authorized.', { status: 403 });
  }

  const [users, submissions] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.submission.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  const dump = {
    exportedAt: new Date().toISOString(),
    app: 'ai-slop-in-the-wild',
    counts: { users: users.length, submissions: submissions.length },
    users,
    submissions,
  };

  const archive = archiver('zip', { zlib: { level: 6 } });
  const pass = new PassThrough();
  // Surface archiver problems instead of hanging the stream silently.
  archive.on('warning', (err) => console.warn('[backup] archiver warning:', err));
  archive.on('error', (err) => {
    console.error('[backup] archiver error:', err);
    pass.destroy(err);
  });
  archive.pipe(pass);

  archive.append(JSON.stringify(dump, null, 2), { name: 'database.json' });

  // Add the actual media files, de-duplicated. Already-compressed media is stored
  // (level 0) to avoid wasting CPU recompressing it.
  const seen = new Set<string>();
  for (const s of submissions) {
    for (const key of [s.mediaPath, s.thumbPath]) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const abs = resolveUpload(key);
      if (abs && existsSync(abs)) {
        // `store: true` skips recompressing already-compressed media (webp/mp4).
        archive.file(abs, { name: `uploads/${key}`, store: true } as archiver.ZipEntryData);
      }
    }
  }

  void archive.finalize();

  const stamp = new Date().toISOString().slice(0, 10);
  const body = Readable.toWeb(pass) as unknown as ReadableStream;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="slop-backup-${stamp}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
