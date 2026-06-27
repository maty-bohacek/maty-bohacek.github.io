'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import LocationPicker, { type LocationValue } from './LocationPicker';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  KNOWN_AI_MODELS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/lib/constants';

type SuccessState = { id: string; status: 'APPROVED' | 'PENDING' };

// Pull the capture date ("date taken") out of an image's EXIF, as YYYY-MM-DD.
// Reads raw values so the camera's local date isn't shifted across timezones.
async function extractCaptureDate(file: File): Promise<string | null> {
  try {
    const exifr = (await import('exifr')).default;
    const tags = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
      reviveValues: false,
    });
    const raw = tags?.DateTimeOriginal ?? tags?.CreateDate ?? tags?.ModifyDate;
    if (!raw) return null;
    if (raw instanceof Date) {
      if (Number.isNaN(raw.getTime())) return null;
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const d = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // EXIF datetimes look like "2026:03:15 14:30:22" — take the date part.
    const match = /^(\d{4})[:-](\d{2})[:-](\d{2})/.exec(String(raw));
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  } catch {
    return null;
  }
}

export default function SubmitForm({ autoPublish }: { autoPublish: boolean }) {
  const today = new Date().toISOString().slice(0, 10);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | null>(null);
  const [exifNote, setExifNote] = useState('');
  const [captureDate, setCaptureDate] = useState('');
  const [captureSource, setCaptureSource] = useState<'exif' | 'manual' | null>(null);

  const [location, setLocation] = useState<LocationValue>({
    lat: null,
    lng: null,
    name: '',
    approximate: false,
  });
  const [caption, setCaption] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [sourceType, setSourceType] = useState<'ORIGINAL' | 'LINK'>('ORIGINAL');
  const [sourceUrl, setSourceUrl] = useState('');
  const [modelAttribution, setModelAttribution] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const previewRef = useRef<string | null>(null);

  function setPreview(url: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreviewUrl(url);
  }

  async function onFile(f: File | null) {
    setExifNote('');
    setErrors((e) => ({ ...e, media: '' }));
    if (!f) {
      setFile(null);
      setMediaKind(null);
      setPreview(null);
      return;
    }

    const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(f.type);
    const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(f.type);
    if (!isImage && !isVideo) {
      setErrors((e) => ({ ...e, media: 'Unsupported file type. Use JPG, PNG, WebP, GIF, MP4, or WebM.' }));
      return;
    }
    const max = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (f.size > max) {
      const mb = Math.round(max / (1024 * 1024));
      setErrors((e) => ({ ...e, media: `File is too large (max ${mb} MB).` }));
      return;
    }

    setFile(f);
    setMediaKind(isImage ? 'image' : 'video');
    setPreview(URL.createObjectURL(f));

    // Try to read the capture date from EXIF, unless the user typed one.
    if (isImage && captureSource !== 'manual') {
      const taken = await extractCaptureDate(f);
      if (taken) {
        setCaptureDate(taken);
        setCaptureSource('exif');
        setErrors((e) => ({ ...e, capturedAt: '' }));
      }
    }

    // Try to pull GPS from photo EXIF to pre-fill the location.
    if (isImage && location.lat == null) {
      try {
        const exifr = (await import('exifr')).default;
        const gps = await exifr.gps(f);
        if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
          setLocation((prev) => ({ ...prev, lat: gps.latitude, lng: gps.longitude }));
          setExifNote('Location detected from the photo — adjust the pin if needed.');
          try {
            const res = await fetch(`/api/geocode?lat=${gps.latitude}&lon=${gps.longitude}`);
            const data = await res.json();
            if (data.displayName) {
              setLocation((prev) => ({ ...prev, name: prev.name || data.displayName }));
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* exif not available — fine */
      }
    }
  }

  function validateClient(): boolean {
    const next: Record<string, string> = {};
    if (!file) next.media = 'Attach a photo or video.';
    if (!captureDate) next.capturedAt = 'Add the date this was taken.';
    else if (captureDate > today) next.capturedAt = 'The date can’t be in the future.';
    if (location.lat == null || location.lng == null) next.location = 'Set a location on the map.';
    if (!location.name.trim()) next.locationName = 'Add a location label.';
    if (caption.trim().length < 3) next.caption = 'Add a short caption.';
    if (reasoning.trim().length < 10) next.reasoning = 'Explain why you think this is AI.';
    if (sourceType === 'LINK' && !sourceUrl.trim()) next.sourceUrl = 'Add the source link.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!validateClient() || !file) return;

    setLoading(true);
    const fd = new FormData();
    fd.set('media', file);
    fd.set('caption', caption);
    fd.set('reasoning', reasoning);
    fd.set('locationName', location.name);
    fd.set('latitude', String(location.lat));
    fd.set('longitude', String(location.lng));
    fd.set('locationApproximate', String(location.approximate));
    fd.set('sourceType', sourceType);
    fd.set('capturedAt', captureDate);
    if (sourceType === 'LINK') fd.set('sourceUrl', sourceUrl);
    if (modelAttribution.trim()) fd.set('modelAttribution', modelAttribution.trim());

    try {
      const res = await fetch('/api/submissions', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess({ id: data.id, status: data.status });
        setPreview(null);
      } else {
        setErrors(data.fields ?? {});
        setMessage(data.error ?? 'Submission failed.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-display-sm text-neutral-900">
          {success.status === 'APPROVED' ? 'Live on the map!' : 'Submitted for review'}
        </h2>
        <p className="mx-auto mt-2 max-w-md font-ui text-sm text-neutral-600">
          {success.status === 'APPROVED'
            ? 'Your sighting is now visible to everyone on the map.'
            : 'Thanks! A reviewer will take a look. You can track its status under “My submissions”.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {success.status === 'APPROVED' && (
            <Link href={`/submission/${success.id}`} className="btn btn-secondary">
              View it
            </Link>
          )}
          <Link href="/my" className="btn btn-secondary">
            My submissions
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSuccess(null);
              setFile(null);
              setMediaKind(null);
              setCaptureDate('');
              setCaptureSource(null);
              setLocation({ lat: null, lng: null, name: '', approximate: false });
              setCaption('');
              setReasoning('');
              setSourceType('ORIGINAL');
              setSourceUrl('');
              setModelAttribution('');
              setErrors({});
            }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div
        className={`alert ${autoPublish ? 'alert-success' : 'alert-info'}`}
      >
        {autoPublish
          ? 'As a trusted contributor, your submissions publish to the map immediately.'
          : 'Your submission will be reviewed before it appears on the map.'}
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      {/* Media */}
      <section className="card p-5">
        <label className="label">Photo or video</label>
        <p className="hint mb-3">
          A picture of AI slop you spotted in the real world — a billboard, screen, poster, menu, etc.
        </p>

        {previewUrl && mediaKind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview" className="mb-3 max-h-72 w-full rounded-lg object-contain bg-neutral-100" />
        )}
        {previewUrl && mediaKind === 'video' && (
          <video src={previewUrl} controls className="mb-3 max-h-72 w-full rounded-lg bg-neutral-900" />
        )}

        <input
          type="file"
          accept={[...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES].join(',')}
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          className="block w-full font-ui text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-2 file:font-ui file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-300"
        />
        {errors.media && <p className="field-error">{errors.media}</p>}
        {exifNote && <p className="mt-2 font-ui text-xs text-primary-700">{exifNote}</p>}

        <div className="mt-4">
          <label className="label" htmlFor="capturedAt">
            Date taken
          </label>
          <input
            id="capturedAt"
            type="date"
            className="input"
            max={today}
            value={captureDate}
            onChange={(e) => {
              setCaptureDate(e.target.value);
              setCaptureSource('manual');
              setErrors((er) => ({ ...er, capturedAt: '' }));
            }}
          />
          {captureSource === 'exif' ? (
            <p className="mt-1 font-ui text-xs text-primary-700">
              Read from the photo&apos;s metadata — change it if it&apos;s off.
            </p>
          ) : (
            <p className="hint">
              When the slop was photographed or recorded. We read it from the file when we can —
              otherwise, please set it.
            </p>
          )}
          {errors.capturedAt && <p className="field-error">{errors.capturedAt}</p>}
        </div>
      </section>

      {/* Location */}
      <section className="card p-5">
        <label className="label">Where did you see it?</label>
        <p className="hint mb-3">Search an address, or drop a pin on the map.</p>
        <LocationPicker value={location} onChange={setLocation} error={errors.locationName} />
        {errors.location && <p className="field-error">{errors.location}</p>}
      </section>

      {/* Details */}
      <section className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="caption">
            Caption
          </label>
          <input
            id="caption"
            className="input"
            placeholder="A short title or comment"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
          />
          {errors.caption && <p className="field-error">{errors.caption}</p>}
        </div>

        <div>
          <label className="label" htmlFor="reasoning">
            Why do you believe it&apos;s AI-generated?
          </label>
          <textarea
            id="reasoning"
            className="textarea"
            placeholder="Describe the tell-tale signs, or paste a link to an AI-detector result."
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            maxLength={5000}
          />
          {errors.reasoning && <p className="field-error">{errors.reasoning}</p>}
        </div>

        <div>
          <span className="label">Source</span>
          <div className="flex flex-wrap gap-4 font-ui text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sourceType"
                checked={sourceType === 'ORIGINAL'}
                onChange={() => setSourceType('ORIGINAL')}
              />
              Original photo (mine)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sourceType"
                checked={sourceType === 'LINK'}
                onChange={() => setSourceType('LINK')}
              />
              Link to a post / article
            </label>
          </div>
          {sourceType === 'LINK' && (
            <div className="mt-3">
              <input
                className="input"
                placeholder="https://…"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
              {errors.sourceUrl && <p className="field-error">{errors.sourceUrl}</p>}
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="model">
            Suspected model <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            id="model"
            list="known-models"
            className="input"
            placeholder="e.g. Midjourney, Sora…"
            value={modelAttribution}
            onChange={(e) => setModelAttribution(e.target.value)}
            maxLength={120}
          />
          <datalist id="known-models">
            {KNOWN_AI_MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <p className="hint">
            Only add this if you&apos;re highly confident. It&apos;s shown as a <em>claim</em>, not a
            verified fact.
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Uploading…' : 'Submit sighting'}
        </button>
      </div>
    </form>
  );
}
