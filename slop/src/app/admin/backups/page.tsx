import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export const metadata: Metadata = { title: 'Backups' };
export const dynamic = 'force-dynamic';

export default async function BackupsPage() {
  await requireRole('SUPER_ADMIN', '/admin/backups');

  const [users, submissions] = await Promise.all([
    prisma.user.count(),
    prisma.submission.count(),
  ]);

  return (
    <div className="wide-container py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-display-sm text-neutral-900">Backups</h1>
        <p className="mt-1 font-ui text-sm text-neutral-500">
          Download a complete snapshot of the database and all uploaded media. Super admin only.
        </p>
      </header>

      <div className="card max-w-2xl p-6">
        <h2 className="text-lg font-bold text-neutral-900">Full database backup</h2>
        <p className="mt-2 font-ui text-sm text-neutral-600">
          Generates a ZIP archive containing:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-ui text-sm text-neutral-600">
          <li>
            <code>database.json</code> — every user and submission row (enough to restore the data).
          </li>
          <li>
            <code>uploads/…</code> — all stored media files and thumbnails.
          </li>
        </ul>

        <dl className="mt-4 flex gap-6 font-ui text-sm text-neutral-500">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Users</dt>
            <dd className="text-base font-semibold text-neutral-900">{users}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Submissions</dt>
            <dd className="text-base font-semibold text-neutral-900">{submissions}</dd>
          </div>
        </dl>

        <div className="mt-6">
          {/* A plain link triggers a streamed file download from the API route. */}
          <a href="/api/admin/backup" className="btn btn-primary" download>
            Download backup (.zip)
          </a>
        </div>

        <p className="mt-4 font-ui text-xs text-neutral-400">
          The archive can be large if there are many media files — the download may take a moment to
          start. <code>database.json</code> includes password hashes (not plaintext); keep the file
          somewhere safe.
        </p>
      </div>
    </div>
  );
}
