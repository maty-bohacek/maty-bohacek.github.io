'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationPicker, { type LocationValue } from './LocationPicker';
import SubmissionMap from './SubmissionMap';
import EditButton from './EditButton';

/**
 * Shows an item's location (label, map, and an "approximate" hint) and lets the
 * author (or a reviewer) edit all of it inline — including retroactively flipping
 * the approximate flag. The edit affordance sits next to the field label.
 */
export default function LocationEditor({
  id,
  label,
  locationName,
  latitude,
  longitude,
  approximate,
}: {
  id: string;
  label: string;
  locationName: string;
  latitude: number;
  longitude: number;
  approximate: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(locationName);
  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [approx, setApprox] = useState(approximate);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LocationValue>({
    lat: latitude,
    lng: longitude,
    name: locationName,
    approximate,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setDraft({ lat, lng, name, approximate: approx });
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function save() {
    if (draft.lat == null || draft.lng == null) {
      setError('Set a point on the map.');
      return;
    }
    if (!draft.name.trim()) {
      setError('Add a location label.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: draft.name.trim(),
          latitude: draft.lat,
          longitude: draft.lng,
          locationApproximate: draft.approximate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setName(data.locationName ?? draft.name.trim());
        setLat(data.latitude ?? draft.lat);
        setLng(data.longitude ?? draft.lng);
        setApprox(data.locationApproximate ?? draft.approximate);
        setEditing(false);
        router.refresh();
      } else {
        setError(data.fields?.locationName ?? data.fields?.latitude ?? data.error ?? 'Could not save.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <>
      <div className="flex items-center gap-2">
        <dt className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </dt>
        {!editing && <EditButton label={label} onClick={startEditing} />}
      </div>
      {editing ? (
        <dd className="mt-2">
          <LocationPicker value={draft} onChange={setDraft} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={cancel} disabled={saving} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            {error && <span className="font-ui text-xs text-red-600">{error}</span>}
          </div>
        </dd>
      ) : (
        <>
          <dd className="mt-1 text-neutral-700">
            {name}{' '}
            {approx && (
              <span className="badge badge-neutral normal-case align-middle">Approximate</span>
            )}{' '}
            <a
              href={osmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui text-xs text-primary-600 underline"
            >
              open in maps
            </a>
          </dd>
          <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
            <SubmissionMap lat={lat} lng={lng} />
          </div>
        </>
      )}
    </>
  );
}
