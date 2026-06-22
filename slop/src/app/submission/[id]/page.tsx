import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canReview } from '@/lib/roles';
import { mediaUrl } from '@/lib/submissions';
import { formatItemDate, itemDateIso } from '@/lib/dates';
import StatusBadge from '@/components/StatusBadge';
import DateEditor from '@/components/DateEditor';
import ReasoningEditor from '@/components/ReasoningEditor';
import SourceEditor from '@/components/SourceEditor';
import SubmissionMap from '@/components/SubmissionMap';

export const dynamic = 'force-dynamic';

async function load(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: { author: { select: { displayName: true, publicProfile: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await load(id);
  if (!s || s.status !== 'APPROVED') return { title: 'Sighting' };
  const image = mediaUrl(s.thumbPath ?? s.mediaPath);
  return {
    title: s.caption,
    description: `AI slop spotted at ${s.locationName}.`,
    openGraph: { title: s.caption, images: [image] },
  };
}

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await load(id);
  if (!s) notFound();

  const viewer = await getCurrentUser();
  const canEdit = !!viewer && (viewer.id === s.authorId || canReview(viewer.role));

  // Authors are anonymous publicly unless they opted into a public profile;
  // the author themselves and reviewers always see the real name.
  const authorLabel = !s.author
    ? 'Unknown'
    : s.author.publicProfile || canEdit
      ? s.author.displayName
      : 'Anonymous';

  // Non-approved items are visible only to their author and to reviewers+.
  if (s.status !== 'APPROVED' && !canEdit) {
    notFound();
  }

  const osmLink = `https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`;

  return (
    <div className="site-container py-10 md:py-14">
      <Link href="/" className="font-ui text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to the map
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        {s.mediaType === 'IMAGE' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(s.mediaPath)} alt={s.caption} className="max-h-[70vh] w-full object-contain" />
        ) : (
          <video src={mediaUrl(s.mediaPath)} controls className="max-h-[70vh] w-full bg-black" />
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">{s.caption}</h1>
        {s.status !== 'APPROVED' && <StatusBadge status={s.status} />}
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-1 font-ui text-sm text-neutral-500">
        <span>Taken</span>
        {canEdit ? (
          <DateEditor
            id={s.id}
            capturedAt={s.capturedAt ? s.capturedAt.toISOString() : null}
            createdAt={s.createdAt.toISOString()}
            long
          />
        ) : (
          <span>
            {formatItemDate(
              itemDateIso(s.capturedAt ? s.capturedAt.toISOString() : null, s.createdAt.toISOString()),
              { long: true },
            )}
          </span>
        )}
        <span>· posted by {authorLabel}</span>
      </p>

      <dl className="mt-6 space-y-5">
        <div>
          <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Why it&apos;s believed to be AI
          </dt>
          {canEdit ? (
            <dd>
              <ReasoningEditor id={s.id} reasoning={s.reasoning} />
            </dd>
          ) : (
            <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-neutral-700">{s.reasoning}</dd>
          )}
        </div>

        <div>
          <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Source
          </dt>
          {canEdit ? (
            <dd>
              <SourceEditor id={s.id} sourceType={s.sourceType} sourceUrl={s.sourceUrl} />
            </dd>
          ) : (
            <dd className="mt-1 text-neutral-700">
              {s.sourceType === 'LINK' && s.sourceUrl ? (
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline break-all"
                >
                  {s.sourceUrl}
                </a>
              ) : (
                'Original photo'
              )}
            </dd>
          )}
        </div>

        {s.modelAttribution && (
          <div>
            <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Suspected model
            </dt>
            <dd className="mt-1 text-neutral-700">
              {s.modelAttribution}{' '}
              <span className="font-ui text-xs text-neutral-400">(claimed, not verified)</span>
            </dd>
          </div>
        )}

        <div>
          <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Location
          </dt>
          <dd className="mt-1 text-neutral-700">
            {s.locationName}{' '}
            <a href={osmLink} target="_blank" rel="noopener noreferrer" className="font-ui text-xs text-primary-600 underline">
              open in maps
            </a>
          </dd>
          <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
            <SubmissionMap lat={s.latitude} lng={s.longitude} />
          </div>
        </div>
      </dl>
    </div>
  );
}
