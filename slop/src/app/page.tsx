import { prisma } from '@/lib/db';
import { serializeSubmission } from '@/lib/submissions';
import MapExplorer from '@/components/MapExplorer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const subs = await prisma.submission.findMany({
    where: { status: 'APPROVED' },
    include: { author: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 2000,
  });

  return <MapExplorer initial={subs.map((s) => serializeSubmission(s))} />;
}
