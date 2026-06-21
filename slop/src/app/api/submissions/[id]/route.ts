import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canReview } from '@/lib/roles';
import { submissionEditSchema, captureDateToDate } from '@/lib/validation';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Edit fields on an existing submission. Authors may edit their own; reviewers+
// may edit anyone's (e.g. to fix an obviously wrong "date taken"). Currently
// this only updates the capture date.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return fail('You must be logged in.', 401);

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = submissionEditSchema.safeParse(body);
  if (!parsed.success) {
    return fail('Please enter a valid date.', 422, {
      fields: { capturedAt: parsed.error.issues[0]?.message ?? 'Invalid date.' },
    });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!submission) return fail('Submission not found.', 404);

  const isOwner = submission.authorId === user.id;
  if (!isOwner && !canReview(user.role)) {
    return fail('You can only edit your own submissions.', 403);
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: { capturedAt: captureDateToDate(parsed.data.capturedAt) },
    select: { capturedAt: true },
  });

  return ok({ ok: true, capturedAt: updated.capturedAt?.toISOString() ?? null });
}
