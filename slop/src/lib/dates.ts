// Date helpers shared by server and client components. No server-only imports
// here so this is safe to use from 'use client' modules too.
//
// An item's displayed date is the capture date (when the photo/video was
// taken) when known, falling back to the upload date. Capture dates are stored
// at noon UTC of the calendar day, so formatting/slicing in UTC keeps the day
// stable regardless of the viewer's timezone.

/** The ISO timestamp to show for an item: capture date if set, else created. */
export function itemDateIso(capturedAt: string | null, createdAt: string): string {
  return capturedAt ?? createdAt;
}

/** Format an ISO timestamp as a calendar date, anchored to UTC. */
export function formatItemDate(iso: string, opts?: { long?: boolean }): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: opts?.long ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** The `YYYY-MM-DD` value for a date input, derived from an ISO timestamp. */
export function isoToDateInput(iso: string): string {
  return iso.slice(0, 10);
}
