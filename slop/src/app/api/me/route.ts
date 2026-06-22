import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { meUpdateSchema } from '@/lib/validation';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Update the signed-in user's own account settings. Currently just the
// public-profile toggle that controls whether their name is shown on posts.
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail('You must be logged in.', 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = meUpdateSchema.safeParse(body);
  if (!parsed.success) return fail('Nothing valid to update.', 422);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { publicProfile: parsed.data.publicProfile },
    select: { publicProfile: true },
  });

  return ok({ ok: true, publicProfile: updated.publicProfile });
}
