'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SerializedSubmission } from '@/lib/submissions';
import { KNOWN_AI_MODELS } from '@/lib/constants';
import SubmissionCard from './SubmissionCard';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-ui text-sm text-neutral-400">
      Loading map…
    </div>
  ),
});

type Filters = {
  search: string;
  model: string;
  sourceType: '' | 'LINK' | 'ORIGINAL';
  mediaType: '' | 'IMAGE' | 'VIDEO';
  from: string;
  to: string;
};

const EMPTY: Filters = { search: '', model: '', sourceType: '', mediaType: '', from: '', to: '' };

export default function MapExplorer({ initial }: { initial: SerializedSubmission[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [items, setItems] = useState<SerializedSubmission[]>(initial);
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => void run(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function run() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    const qs = new URLSearchParams();
    if (filters.search) qs.set('search', filters.search);
    if (filters.model) qs.set('model', filters.model);
    if (filters.sourceType) qs.set('sourceType', filters.sourceType);
    if (filters.mediaType) qs.set('mediaType', filters.mediaType);
    if (filters.from) qs.set('from', filters.from);
    if (filters.to) qs.set('to', filters.to);

    try {
      const res = await fetch(`/api/submissions?${qs.toString()}`, { signal: ac.signal });
      const data = await res.json();
      setItems(data.submissions ?? []);
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const hasFilters = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY),
    [filters],
  );

  return (
    <div className="wide-container py-8">
      <header className="mb-6">
        <h1 className="text-display-sm text-neutral-900">AI Slop in the Wild</h1>
        <p className="mt-2 max-w-2xl font-ui text-sm text-neutral-600">
          A community map of AI-generated imagery and video spotted out in the real world — on
          billboards, screens, flyers, and storefronts. Each pin is a sighting, with a reason it&apos;s
          believed to be AI.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <input
              type="search"
              placeholder="Search caption, place, model…"
              className="input"
              value={filters.search}
              onChange={(e) => set({ search: e.target.value })}
            />
          </div>
          <input
            list="model-list"
            placeholder="Model"
            className="input"
            value={filters.model}
            onChange={(e) => set({ model: e.target.value })}
          />
          <datalist id="model-list">
            {KNOWN_AI_MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <select
            className="select"
            value={filters.mediaType}
            onChange={(e) => set({ mediaType: e.target.value as Filters['mediaType'] })}
          >
            <option value="">Any media</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Video</option>
          </select>
          <select
            className="select"
            value={filters.sourceType}
            onChange={(e) => set({ sourceType: e.target.value as Filters['sourceType'] })}
          >
            <option value="">Any source</option>
            <option value="ORIGINAL">Original photo</option>
            <option value="LINK">Linked source</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input"
              value={filters.from}
              onChange={(e) => set({ from: e.target.value })}
              aria-label="From date"
            />
            <span className="font-ui text-xs text-neutral-400">to</span>
            <input
              type="date"
              className="input"
              value={filters.to}
              onChange={(e) => set({ to: e.target.value })}
              aria-label="To date"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-ui text-xs text-neutral-500">
            {loading ? 'Updating…' : `${items.length} sighting${items.length === 1 ? '' : 's'}`}
          </p>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters(EMPTY)}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-[58vh] min-h-[360px] overflow-hidden rounded-xl border border-neutral-200">
        <MapView submissions={items} />
      </div>

      {/* Gallery */}
      <div className="mt-8">
        <h2 className="mb-4 font-ui text-sm font-bold uppercase tracking-wide text-neutral-500">
          Recent sightings
        </h2>
        {items.length === 0 ? (
          <p className="py-12 text-center font-ui text-sm text-neutral-400">
            No sightings match your filters yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.slice(0, 60).map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
