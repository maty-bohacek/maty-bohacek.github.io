'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditButton from './EditButton';

type SourceType = 'LINK' | 'ORIGINAL';

/**
 * Shows an item's source (a link or "Original photo") and lets the author (or a
 * reviewer) edit it inline. The edit affordance sits next to the field label.
 */
export default function SourceEditor({
  id,
  sourceType,
  sourceUrl,
  label,
}: {
  id: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  label: string;
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

  return (
    <>
      <div className="flex items-center gap-2">
        <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </dt>
        {!editing && <EditButton label={label} onClick={startEditing} />}
      </div>
      <dd className="mt-1">
        {editing ? (
          <div>
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
        ) : (
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
        )}
      </dd>
    </>
  );
}
