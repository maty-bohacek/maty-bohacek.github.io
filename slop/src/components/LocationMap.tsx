'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as LeafletNS from 'leaflet';

const PIN_HTML = `
<svg width="30" height="30" viewBox="0 0 24 24" fill="#16a34a" stroke="#ffffff" stroke-width="1.5"
     style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  <circle cx="12" cy="9" r="2.5" fill="#ffffff" stroke="none"/>
</svg>`;

export default function LocationMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markerRef = useRef<LeafletNS.Marker | null>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  function placeMarker(L: typeof LeafletNS, map: LeafletNS.Map, la: number, ln: number) {
    if (markerRef.current) {
      markerRef.current.setLatLng([la, ln]);
    } else {
      const icon = L.divIcon({ html: PIN_HTML, className: '', iconSize: [30, 30], iconAnchor: [15, 28] });
      const marker = L.marker([la, ln], { icon, draggable: true });
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        pickRef.current(p.lat, p.lng);
      });
      marker.addTo(map);
      markerRef.current = marker;
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default as unknown as typeof LeafletNS;
      if (cancelled || !elRef.current || mapRef.current) return;
      LRef.current = L;

      const start: [number, number] =
        lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
          ? [lat, lng]
          : [25, 5];
      const map = L.map(elRef.current, { minZoom: 2 }).setView(start, lat != null ? 13 : 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: LeafletNS.LeafletMouseEvent) => {
        pickRef.current(e.latlng.lat, e.latlng.lng);
      });

      if (lat != null && lng != null) placeMarker(L, map, lat, lng);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect externally-set coordinates (address search, EXIF) onto the map.
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    placeMarker(L, map, lat, lng);
    map.setView([lat, lng], Math.max(map.getZoom() ?? 0, 13));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return <div ref={elRef} className="h-64 w-full rounded-lg border border-neutral-200" />;
}
