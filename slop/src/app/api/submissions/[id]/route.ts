import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canReview } from '@/lib/roles';
import { submissionEditSchema, captureDateToDate, fieldErrors } from '@/lib/validation';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Edit fields on an existing submission. Authors may edit their own; reviewers+
// may edit anyone's (e.g. to fix an obviously wrong "date taken"). Updatable
// fields: the capture date, the reasoning, and the source.
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
    return fail('Please check the highlighted fields.', 422, {
      fields: fieldErrors(parsed.error),
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

  const data: Prisma.SubmissionUpdateInput = {};
  if (parsed.data.capturedAt !== undefined) {
    data.capturedAt = captureDateToDate(parsed.data.capturedAt);
  }
  if (parsed.data.reasoning !== undefined) {
    data.reasoning = parsed.data.reasoning;
  }
  if (parsed.data.sourceType !== undefined) {
    data.sourceType = parsed.data.sourceType;
    // Keep the URL consistent with the type: drop it for original photos.
    data.sourceUrl = parsed.data.sourceType === 'LINK' ? parsed.data.sourceUrl || null : null;
  }

  const updated = await prisma.submission.update({
    where: { id },
    data,
    select: { capturedAt: true, reasoning: true, sourceType: true, sourceUrl: true },
  });

  return ok({
    ok: true,
    capturedAt: updated.capturedAt?.toISOString() ?? null,
    reasoning: updated.reasoning,
    sourceType: updated.sourceType,
    sourceUrl: updated.sourceUrl,
  });
}
