'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatItemDate, isoToDateInput, itemDateIso } from '@/lib/dates';

/**
 * Shows an item's "date taken" and lets the author edit it inline. The displayed
 * value is the capture date when set, otherwise the upload date — editing always
 * writes a real capture date back to the submission.
 */
export default function DateEditor({
  id,
  capturedAt,
  createdAt,
  long = false,
  className = '',
}: {
  id: string;
  capturedAt: string | null;
  createdAt: string;
  long?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string | null>(capturedAt);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => isoToDateInput(capturedAt ?? createdAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  function startEditing() {
    setDraft(isoToDateInput(value ?? createdAt));
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function save() {
    if (!draft) {
      setError('Pick a date.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capturedAt: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setValue(data.capturedAt ?? null);
        setEditing(false);
        router.refresh();
      } else {
        setError(data.fields?.capturedAt ?? data.error ?? 'Could not save.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
        <input
          type="date"
          className="rounded border border-neutral-300 px-1.5 py-0.5 font-ui text-xs text-neutral-700"
          value={draft}
          max={today}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="font-ui text-xs font-semibold text-primary-600 hover:underline disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="font-ui text-xs text-neutral-400 hover:underline disabled:opacity-50"
        >
          Cancel
        </button>
        {error && <span className="font-ui text-xs text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{formatItemDate(itemDateIso(value, createdAt), { long })}</span>
      <button
        type="button"
        onClick={startEditing}
        title="Edit date taken"
        aria-label="Edit date taken"
        className="text-neutral-400 transition-colors hover:text-primary-600"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </span>
  );
}
