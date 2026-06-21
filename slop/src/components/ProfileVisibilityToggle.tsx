'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Lets the signed-in author opt in/out of a public profile. Posts are
 * anonymous by default — turning this on credits their sightings to their
 * display name everywhere they appear publicly.
 */
export default function ProfileVisibilityToggle({ initialPublic }: { initialPublic: boolean }) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    const next = !isPublic;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicProfile: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setIsPublic(Boolean(data.publicProfile));
        router.refresh();
      } else {
        setError(data.error ?? 'Could not update.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-ui text-sm font-semibold text-neutral-900">
          {isPublic ? 'Your name is public on your posts' : 'Your posts are anonymous'}
        </p>
        <p className="mt-0.5 font-ui text-xs text-neutral-500">
          {isPublic
            ? 'Visitors see your display name as the author of each sighting.'
            : 'Visitors see “Anonymous” instead of your name. Turn this on to credit your sightings to you.'}
        </p>
        {error && <p className="mt-1 font-ui text-xs text-red-600">{error}</p>}
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`btn btn-sm shrink-0 ${isPublic ? 'btn-secondary' : 'btn-primary'}`}
        aria-pressed={isPublic}
      >
        {saving ? 'Saving…' : isPublic ? 'Make me anonymous' : 'Make my profile public'}
      </button>
    </div>
  );
}
