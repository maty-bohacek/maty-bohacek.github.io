import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canManageUsers } from '@/lib/roles';
import { adminUpdateSchema } from '@/lib/validation';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) return fail('Not authorized.', 403);

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) return fail('Nothing valid to update.', 422);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return fail('User not found.', 404);

  // The super admin is governed by env vars and cannot be edited from the UI.
  if (target.role === 'SUPER_ADMIN') {
    return fail('The super admin account cannot be modified here.', 403);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      ...(parsed.data.banned !== undefined ? { banned: parsed.data.banned } : {}),
    },
    select: { id: true, role: true, banned: true },
  });

  return ok({ ok: true, user: updated });
}
