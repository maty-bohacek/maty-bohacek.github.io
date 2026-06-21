import { getCurrentUser } from '@/lib/session';
import { geocodeSearch, reverseGeocode } from '@/lib/geocode';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp, fail, ok } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Geocoding proxy for the submit form. Login-gated so it isn't an open proxy.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail('Unauthorized.', 401);

  const limit = rateLimit(`geocode:${user.id}`, 40, 60 * 1000);
  if (!limit.ok) return fail('Slow down a moment.', 429);

  const sp = new URL(request.url).searchParams;
  const q = sp.get('q')?.trim();
  const lat = sp.get('lat');
  const lon = sp.get('lon');

  try {
    if (q) {
      const results = await geocodeSearch(q);
      return ok({ results });
    }
    if (lat && lon) {
      const latitude = Number(lat);
      const longitude = Number(lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return fail('Invalid coordinates.');
      }
      const displayName = await reverseGeocode(latitude, longitude);
      return ok({ displayName });
    }
  } catch {
    return fail('Geocoding service is unavailable right now.', 502);
  }

  return fail('Provide a query (q) or lat/lon.');
}
