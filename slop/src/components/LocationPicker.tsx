'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-lg border border-neutral-200 bg-neutral-50" />,
});

export type LocationValue = { lat: number | null; lng: number | null; name: string };

type GeoResult = { displayName: string; latitude: number; longitude: number };

export default function LocationPicker({
  value,
  onChange,
  error,
}: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function choose(r: GeoResult) {
    onChange({ lat: r.latitude, lng: r.longitude, name: r.displayName });
    setResults([]);
    setQuery('');
  }

  async function onMapPick(lat: number, lng: number) {
    // Set coordinates immediately; suggest a label only if none chosen yet.
    onChange({ ...value, lat, lng });
    if (!value.name.trim()) {
      try {
        const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data.displayName) onChange({ lat, lng, name: data.displayName });
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div>
      {/* Address search */}
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Search an address or place"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void search();
            }
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => void search()} disabled={searching}>
          {searching ? '…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left font-ui text-sm text-neutral-700 hover:bg-neutral-100"
                onClick={() => choose(r)}
              >
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="hint mt-2">Or click the map to drop a pin, then drag to fine-tune.</p>

      <div className="mt-2">
        <LocationMap lat={value.lat} lng={value.lng} onPick={onMapPick} />
      </div>

      {/* Editable label + coordinates */}
      <div className="mt-3">
        <label className="label" htmlFor="locationName">
          Location label
        </label>
        <input
          id="locationName"
          className="input"
          placeholder="e.g. Times Square, New York"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        {error && <p className="field-error">{error}</p>}
        {value.lat != null && value.lng != null && (
          <p className="hint font-mono">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
