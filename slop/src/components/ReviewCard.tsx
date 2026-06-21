'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SerializedSubmission } from '@/lib/submissions';

export default function ReviewCard({ submission }: { submission: SerializedSubmission }) {
  const s = submission;
  const router = useRouter();
  const [resolved, setResolved] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function act(action: 'approve' | 'reject') {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/review/${s.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: action === 'reject' ? note : '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResolved(data.status);
        router.refresh();
      } else {
        setError(data.error ?? 'Action failed.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  if (resolved) {
    return (
      <div className={`alert ${resolved === 'APPROVED' ? 'alert-success' : 'alert-error'}`}>
        {resolved === 'APPROVED' ? 'Approved — now live on the map.' : 'Rejected.'}
      </div>
    );
  }

  return (
    <article className="card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-neutral-100">
          {s.mediaType === 'IMAGE' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.mediaUrl} alt={s.caption} className="h-full max-h-[420px] w-full object-contain" />
          ) : (
            <video src={s.mediaUrl} controls className="h-full max-h-[420px] w-full bg-black" />
          )}
        </div>

        <div className="flex flex-col p-5">
          <h3 className="text-lg font-bold text-neutral-900">{s.caption}</h3>
          <p className="mt-1 font-ui text-xs text-neutral-500">
            by {s.authorName} · {new Date(s.createdAt).toLocaleString()}
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Location
              </dt>
              <dd className="text-neutral-700">
                {s.locationName}{' '}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-xs text-primary-600 underline"
                >
                  (map)
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Reasoning
              </dt>
              <dd className="whitespace-pre-wrap text-neutral-700">{s.reasoning}</dd>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Source
                </dt>
                <dd className="text-neutral-700">
                  {s.sourceType === 'LINK' && s.sourceUrl ? (
                    <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline break-all">
                      {s.sourceUrl}
                    </a>
                  ) : (
                    'Original photo'
                  )}
                </dd>
              </div>
              {s.modelAttribution && (
                <div>
                  <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Claimed model
                  </dt>
                  <dd className="text-neutral-700">{s.modelAttribution}</dd>
                </div>
              )}
            </div>
          </dl>

          {error && <p className="field-error mt-3">{error}</p>}

          <div className="mt-auto pt-5">
            {showReject && (
              <input
                className="input mb-2"
                placeholder="Optional note (shown to the submitter)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" disabled={loading} onClick={() => act('approve')}>
                Approve
              </button>
              {showReject ? (
                <button className="btn btn-danger flex-1" disabled={loading} onClick={() => act('reject')}>
                  Confirm reject
                </button>
              ) : (
                <button className="btn btn-secondary flex-1" disabled={loading} onClick={() => setShowReject(true)}>
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
