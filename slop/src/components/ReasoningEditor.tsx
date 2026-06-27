'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_REASONING_LENGTH } from '@/lib/constants';
import EditButton from './EditButton';

/**
 * Shows an item's "why it's believed to be AI" explanation and lets the author
 * (or a reviewer) edit it inline. The edit affordance sits next to the field
 * label (passed in), not next to the content.
 */
export default function ReasoningEditor({
  id,
  reasoning,
  label,
}: {
  id: string;
  reasoning: string;
  label: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(reasoning);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reasoning);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setDraft(value);
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function save() {
    if (draft.trim().length < 10) {
      setError('Explain why you believe this is AI-generated.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasoning: draft.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setValue(data.reasoning ?? draft.trim());
        setEditing(false);
        router.refresh();
      } else {
        setError(data.fields?.reasoning ?? data.error ?? 'Could not save.');
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
          <>
            <textarea
              className="textarea"
              value={draft}
              maxLength={MAX_REASONING_LENGTH}
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
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
          </>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-neutral-700">{value}</p>
        )}
      </dd>
    </>
  );
}
