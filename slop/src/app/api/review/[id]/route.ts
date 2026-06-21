import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canReview } from '@/lib/roles';
import { reviewSchema } from '@/lib/validation';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !canReview(user.role)) return fail('Not authorized to review.', 403);

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return fail('Invalid review action.', 422);

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return fail('Submission not found.', 404);

  // Reviewers may not approve their own submissions; only the super admin can.
  if (submission.authorId === user.id && user.role !== 'SUPER_ADMIN') {
    return fail('You cannot review your own submission.', 403);
  }

  const status = parsed.data.action === 'approve' ? 'APPROVED' : 'REJECTED';
  const updated = await prisma.submission.update({
    where: { id },
    data: {
      status,
      reviewedById: user.id,
      reviewedAt: new Date(),
      reviewNote: parsed.data.note ? parsed.data.note : null,
    },
  });

  return ok({ ok: true, status: updated.status });
}
