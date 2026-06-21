import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import UsersAdmin, { type AdminUser } from '@/components/UsersAdmin';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireRole('SUPER_ADMIN', '/admin/users');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: { _count: { select: { submissions: true } } },
  });

  const rows: AdminUser[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    banned: u.banned,
    createdAt: u.createdAt.toISOString(),
    submissions: u._count.submissions,
  }));

  return (
    <div className="wide-container py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-display-sm text-neutral-900">Users</h1>
        <p className="mt-1 font-ui text-sm text-neutral-500">
          {rows.length} registered. Promote contributors to <strong>Trusted</strong> (publish
          directly) or <strong>Reviewer</strong> (approve others), or ban abusers.
        </p>
      </header>

      <UsersAdmin users={rows} />
    </div>
  );
}
