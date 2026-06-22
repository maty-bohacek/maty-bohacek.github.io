'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_REASONING_LENGTH } from '@/lib/constants';

/**
 * Shows an item's "why it's believed to be AI" explanation and lets the author
 * (or a reviewer) edit it inline, mirroring how the date is edited.
 */
export default function ReasoningEditor({
  id,
  reasoning,
}: {
  id: string;
  reasoning: string;
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

  if (editing) {
    return (
      <div className="mt-1">
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
      </div>
    );
  }

  return (
    <div className="mt-1">
      <p className="whitespace-pre-wrap leading-relaxed text-neutral-700">{value}</p>
      <button
        type="button"
        onClick={startEditing}
        className="mt-1 inline-flex items-center gap-1 font-ui text-xs text-neutral-400 transition-colors hover:text-primary-600"
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
