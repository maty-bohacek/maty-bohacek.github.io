'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SourceType = 'LINK' | 'ORIGINAL';

/**
 * Shows an item's source (a link or "Original photo") and lets the author (or a
 * reviewer) edit it inline, mirroring how the date is edited.
 */
export default function SourceEditor({
  id,
  sourceType,
  sourceUrl,
}: {
  id: string;
  sourceType: SourceType;
  sourceUrl: string | null;
}) {
  const router = useRouter();
  const [type, setType] = useState<SourceType>(sourceType);
  const [url, setUrl] = useState(sourceUrl ?? '');
  const [editing, setEditing] = useState(false);
  const [draftType, setDraftType] = useState<SourceType>(sourceType);
  const [draftUrl, setDraftUrl] = useState(sourceUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setDraftType(type);
    setDraftUrl(url);
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function save() {
    if (draftType === 'LINK' && !draftUrl.trim()) {
      setError('Add the source link.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: draftType,
          sourceUrl: draftType === 'LINK' ? draftUrl.trim() : '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setType(data.sourceType ?? draftType);
        setUrl(data.sourceUrl ?? '');
        setEditing(false);
        router.refresh();
      } else {
        setError(data.fields?.sourceUrl ?? data.error ?? 'Could not save.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="mt-1">
        <div className="flex flex-wrap gap-4 font-ui text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`sourceType-${id}`}
              checked={draftType === 'ORIGINAL'}
              disabled={saving}
              onChange={() => setDraftType('ORIGINAL')}
            />
            Original photo (mine)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`sourceType-${id}`}
              checked={draftType === 'LINK'}
              disabled={saving}
              onChange={() => setDraftType('LINK')}
            />
            Link to a post / article
          </label>
        </div>
        {draftType === 'LINK' && (
          <input
            className="input mt-3"
            placeholder="https://…"
            value={draftUrl}
            disabled={saving}
            onChange={(e) => setDraftUrl(e.target.value)}
          />
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          {error && <span className="font-ui text-xs text-red-600">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span className="text-neutral-700">
        {type === 'LINK' && url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 underline break-all"
          >
            {url}
          </a>
        ) : (
          'Original photo'
        )}
      </span>
      <button
        type="button"
        onClick={startEditing}
        className="inline-flex items-center gap-1 font-ui text-xs text-neutral-400 transition-colors hover:text-primary-600"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit
      </button>
    </div>
  );
}
