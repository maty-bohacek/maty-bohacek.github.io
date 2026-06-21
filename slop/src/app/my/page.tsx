import Link from 'next/link';
import type { Metadata } from 'next';
import type { SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { serializeSubmission } from '@/lib/submissions';
import SubmissionCard from '@/components/SubmissionCard';

export const metadata: Metadata = { title: 'My submissions' };
export const dynamic = 'force-dynamic';

const TABS: { key: string; label: string; status?: SubmissionStatus }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Live', status: 'APPROVED' },
  { key: 'pending', label: 'Pending', status: 'PENDING' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED' },
];

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser('/my');
  const { status } = await searchParams;
  const active = TABS.find((t) => t.key === status) ?? TABS[0];

  const [items, counts] = await Promise.all([
    prisma.submission.findMany({
      where: { authorId: user.id, ...(active.status ? { status: active.status } : {}) },
      include: { author: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.submission.groupBy({
      by: ['status'],
      where: { authorId: user.id },
      _count: true,
    }),
  ]);

  const countFor = (s?: SubmissionStatus) =>
    s ? counts.find((c) => c.status === s)?._count ?? 0 : counts.reduce((n, c) => n + c._count, 0);

  return (
    <div className="wide-container py-10 md:py-14">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display-sm text-neutral-900">My submissions</h1>
          <p className="mt-1 font-ui text-sm text-neutral-500">
            Track everything you&apos;ve submitted and its review status.
          </p>
        </div>
        <Link href="/submit" className="btn btn-primary">
          New sighting
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === 'all' ? '/my' : `/my?status=${t.key}`}
            className={`btn btn-sm ${active.key === t.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.label}
            <span className="ml-1 opacity-70">{countFor(t.status)}</span>
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-ui text-sm text-neutral-500">Nothing here yet.</p>
          <Link href="/submit" className="btn btn-primary mt-4 inline-flex">
            Submit your first sighting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={serializeSubmission(s, { includeReviewNote: true })}
              showStatus
            />
          ))}
        </div>
      )}
    </div>
  );
}
