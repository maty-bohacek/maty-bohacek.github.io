'use client';

import { useMemo, useState } from 'react';
import AudienceTag, { AUDIENCE_LABELS } from '@/components/AudienceTag';
import { ArrowUpRightIcon } from '@/components/Icons';
import { SpeakingAudience, SpeakingEngagement } from '@/types';

const FILTERS: SpeakingAudience[] = ['industry', 'academic'];

// Dates are stored as calendar days; format them in UTC so the server-rendered
// page and the browser agree whatever the visitor's time zone.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function SpeakingEngagements({ engagements }: { engagements: SpeakingEngagement[] }) {
  const [audience, setAudience] = useState<SpeakingAudience | null>(null);

  const byYear = useMemo(() => {
    const groups: [number, SpeakingEngagement[]][] = [];
    for (const engagement of engagements) {
      if (audience && !engagement.audiences.includes(audience)) continue;
      const year = new Date(engagement.date).getUTCFullYear();
      const last = groups[groups.length - 1];
      if (last && last[0] === year) last[1].push(engagement);
      else groups.push([year, [engagement]]);
    }
    return groups;
  }, [engagements, audience]);

  const chip = (active: boolean) =>
    `px-3 py-1 text-xs font-ui transition-colors ${
      active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button type="button" onClick={() => setAudience(null)} aria-pressed={audience === null} className={chip(audience === null)}>
          All <span className="opacity-60">{engagements.length}</span>
        </button>
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setAudience(audience === id ? null : id)}
            aria-pressed={audience === id}
            className={chip(audience === id)}
          >
            {AUDIENCE_LABELS[id]}{' '}
            <span className="opacity-60">{engagements.filter((e) => e.audiences.includes(id)).length}</span>
          </button>
        ))}
      </div>

      {byYear.map(([year, items]) => (
        <div key={year} className="mb-10 last:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wide font-ui">{year}</h3>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <ul>
            {items.map((e) => (
              <li key={e.id} className="grid grid-cols-[3.25rem_1fr] gap-x-3 py-4 border-b border-neutral-200 last:border-0">
                <time dateTime={e.date} className="text-sm font-ui text-neutral-500 pt-0.5">
                  {formatDate(e.date)}
                </time>
                <div className="min-w-0">
                  <p className="text-neutral-900 leading-snug">
                    {e.link ? (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold hover:text-primary-600 transition-colors"
                      >
                        {e.event}
                        <ArrowUpRightIcon className="inline w-3 h-3 ml-0.5 -mt-0.5 text-neutral-400" />
                      </a>
                    ) : (
                      <span className="font-bold">{e.event}</span>
                    )}
                    {e.detail && <span className="text-neutral-500"> · {e.detail}</span>}
                  </p>
                  {e.talk && <p className="mt-0.5 italic text-neutral-700 leading-snug">{e.talk}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-ui text-neutral-500">
                    <span>{e.format}</span>
                    {e.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{e.location}</span>
                      </>
                    )}
                    {!audience && e.audiences.map((a) => <AudienceTag key={a} audience={a} />)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
