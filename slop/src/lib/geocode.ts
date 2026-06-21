import 'server-only';

// Thin wrapper over OpenStreetMap's Nominatim. Free and key-less, but their
// usage policy asks for a descriptive User-Agent with a contact, and a max of
// ~1 request/second. Traffic here is light (only the submit form uses it).

export type GeoResult = {
  displayName: string;
  latitude: number;
  longitude: number;
};

function userAgent(): string {
  const contact = process.env.NOMINATIM_CONTACT || 'unknown';
  return `AI-Slop-in-the-Wild/1.0 (${contact})`;
}

const BASE = 'https://nominatim.openstreetmap.org';

export async function geocodeSearch(query: string, limit = 5): Promise<GeoResult[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL(`${BASE}/search`);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '0');

  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent(), Accept: 'application/json' },
    // Cache identical lookups for a day at the edge/runtime.
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return data
    .map((d) => ({
      displayName: d.display_name,
      latitude: Number(d.lat),
      longitude: Number(d.lon),
    }))
    .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const url = new URL(`${BASE}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');

  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent(), Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? null;
}
