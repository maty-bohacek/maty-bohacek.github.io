'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as LeafletNS from 'leaflet';

// Brand-green teardrop pin — same marker used by the location picker.
const PIN_HTML = `
<svg width="30" height="30" viewBox="0 0 24 24" fill="#16a34a" stroke="#ffffff" stroke-width="1.5"
     style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  <circle cx="12" cy="9" r="2.5" fill="#ffffff" stroke="none"/>
</svg>`;

/**
 * Read-only location map for a single sighting. Uses the same CARTO light tiles
 * and styling as the main explore map so the two feel like one family.
 */
export default function SubmissionMap({ lat, lng }: { lat: number; lng: number }) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default as unknown as typeof LeafletNS;
      if (cancelled || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, { scrollWheelZoom: false, minZoom: 2 }).setView(
        [lat, lng],
        15,
      );
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({ html: PIN_HTML, className: '', iconSize: [30, 30], iconAnchor: [15, 28] });
      L.marker([lat, lng], { icon }).addTo(map);

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={elRef} className="h-64 w-full" />;
}
