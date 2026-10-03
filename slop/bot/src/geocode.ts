// Geocode a place string via OpenStreetMap Nominatim (no API key), matching the
// app's own geocoding backend. Rate-limited to Nominatim's 1 request/second
// policy and sends a contact per their usage rules.

import { sleep } from './reddit.js';
import type { Config } from './config.js';

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export class Geocoder {
  private lastCall = 0;

  constructor(private cfg: Config['nominatim']) {}

  async geocode(query: string): Promise<GeocodeResult | null> {
    // Respect the 1 req/s policy.
    const since = Date.now() - this.lastCall;
    if (since < 1100) await sleep(1100 - since);
    this.lastCall = Date.now();

    const url = new URL(ENDPOINT);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('email', this.cfg.contact);

    const res = await fetch(url, {
      headers: {
        'User-Agent': `slop-research-importer/0.1 (${this.cfg.contact})`,
        'Accept-Language': 'en',
      },
    });
    if (!res.ok) return null;

    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const first = rows[0];
    if (!first) return null;

    return {
      latitude: Number(first.lat),
      longitude: Number(first.lon),
      displayName: first.display_name,
    };
  }
}
