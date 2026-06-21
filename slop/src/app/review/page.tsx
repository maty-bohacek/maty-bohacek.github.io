import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { serializeSubmission } from '@/lib/submissions';
import ReviewCard from '@/components/ReviewCard';

export const metadata: Metadata = { title: 'Review queue' };
export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const user = await requireRole('REVIEWER', '/review');

  // Reviewers can't act on their own submissions, so don't surface them.
  // The super admin sees everything pending.
  const where: Prisma.SubmissionWhereInput =
    user.role === 'SUPER_ADMIN'
      ? { status: 'PENDING' }
      : { status: 'PENDING', authorId: { not: user.id } };

  const items = await prisma.submission.findMany({
    where,
    include: { author: { select: { displayName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="wide-container py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-display-sm text-neutral-900">Review queue</h1>
        <p className="mt-1 font-ui text-sm text-neutral-500">
          {items.length} submission{items.length === 1 ? '' : 's'} awaiting review.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-ui text-sm text-neutral-500">The queue is empty. Nicely done.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((s) => (
            <ReviewCard key={s.id} submission={serializeSubmission(s)} />
          ))}
        </div>
      )}
    </div>
  );
}
