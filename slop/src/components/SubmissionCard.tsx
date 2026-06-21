import Link from 'next/link';
import type { SerializedSubmission } from '@/lib/submissions';
import StatusBadge from './StatusBadge';

function PinIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <circle cx="12" cy="11" r="2.5" strokeWidth={2} />
    </svg>
  );
}

export default function SubmissionCard({
  submission,
  showStatus = false,
}: {
  submission: SerializedSubmission;
  showStatus?: boolean;
}) {
  const s = submission;
  const href = `/submission/${s.id}`;

  return (
    <article className="card flex flex-col animate-fade-in">
      <Link href={href} className="group relative block aspect-[4/3] bg-neutral-100 overflow-hidden">
        {s.mediaType === 'IMAGE' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.thumbUrl ?? s.mediaUrl}
            alt={s.caption}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <>
            <video
              src={s.mediaUrl}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                <svg className="w-5 h-5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </>
        )}
        <span className="absolute top-2 left-2 badge badge-neutral">
          {s.mediaType === 'VIDEO' ? 'Video' : 'Image'}
        </span>
        {showStatus && (
          <span className="absolute top-2 right-2">
            <StatusBadge status={s.status} />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-bold leading-snug text-neutral-900 line-clamp-2">
          <Link href={href} className="transition-colors hover:text-primary-600">
            {s.caption}
          </Link>
        </h3>

        <p className="flex items-center gap-1 font-ui text-xs text-neutral-500">
          <PinIcon />
          <span className="truncate">{s.locationName}</span>
        </p>

        {s.modelAttribution && (
          <span className="badge badge-neutral self-start normal-case">
            Claimed: {s.modelAttribution}
          </span>
        )}

        {showStatus && s.reviewNote && (
          <p className="rounded bg-neutral-50 px-2 py-1 font-ui text-xs text-neutral-600">
            <span className="font-semibold">Reviewer note:</span> {s.reviewNote}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1 font-ui text-xs text-neutral-400">
          <span className="truncate">by {s.authorName}</span>
          <span className="shrink-0">
            {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </article>
  );
}
