'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type * as LeafletNS from 'leaflet';
import type { SerializedSubmission } from '@/lib/submissions';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PLAY_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

function popupHtml(s: SerializedSubmission): string {
  const media =
    s.mediaType === 'VIDEO'
      ? `<video src="${escapeHtml(s.mediaUrl)}" controls preload="metadata" style="width:100%;height:140px;object-fit:cover;display:block;background:#111"></video>`
      : `<img src="${escapeHtml(s.thumbUrl ?? s.mediaUrl)}" alt="" style="width:100%;height:140px;object-fit:cover;display:block" />`;

  const model = s.modelAttribution
    ? `<div style="margin-top:4px"><span class="badge badge-neutral" style="text-transform:none">Claimed: ${escapeHtml(s.modelAttribution)}</span></div>`
    : '';

  const source =
    s.sourceType === 'LINK' && s.sourceUrl
      ? `<a href="${escapeHtml(s.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:underline">Source</a>`
      : '<span style="color:#737373">Original photo</span>';

  return `
    <div style="font-family:Inter,sans-serif">
      ${media}
      <div style="padding:10px 12px 12px">
        <div style="font-family:Charter,Georgia,serif;font-weight:700;font-size:15px;line-height:1.3;color:#1a1a1a">${escapeHtml(s.caption)}</div>
        <div style="font-size:12px;color:#737373;margin-top:3px">${escapeHtml(s.locationName)}${
          s.locationApproximate
            ? ' <span style="color:#a3a3a3">(approx.)</span>'
            : ''
        }</div>
        ${model}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px">
          ${source}
          <a href="/submission/${encodeURIComponent(s.id)}" style="color:#16a34a;font-weight:600;text-decoration:none">Details →</a>
        </div>
      </div>
    </div>`;
}

export default function MapView({ submissions }: { submissions: SerializedSubmission[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  // markercluster has no first-class types here; keep it loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef = useRef<any>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const dataRef = useRef<SerializedSubmission[]>(submissions);
  dataRef.current = submissions;

  function renderMarkers() {
    const L = LRef.current;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!L || !map || !cluster) return;

    cluster.clearLayers();
    const markers: LeafletNS.Marker[] = [];

    for (const s of dataRef.current) {
      if (!Number.isFinite(s.latitude) || !Number.isFinite(s.longitude)) continue;
      const inner =
        s.mediaType === 'VIDEO'
          ? `<div class="slop-marker slop-marker-video">${PLAY_SVG}</div>`
          : `<div class="slop-marker" style="background-image:url('${escapeHtml(
              s.thumbUrl ?? s.mediaUrl,
            )}')"></div>`;

      const icon = L.divIcon({
        html: inner,
        className: '',
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([s.latitude, s.longitude], { icon });
      marker.bindPopup(popupHtml(s), { minWidth: 240, maxWidth: 240 });
      markers.push(marker);
      cluster.addLayer(marker);
    }

    if (markers.length) {
      const group = L.featureGroup(markers);
      try {
        map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 13 });
      } catch {
        /* single/identical points can throw — ignore */
      }
    }
  }

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default as unknown as typeof LeafletNS;
      await import('leaflet.markercluster');
      if (cancelled || !elRef.current || mapRef.current) return;

      LRef.current = L;
      const map = L.map(elRef.current, { worldCopyJump: true, minZoom: 2 }).setView([25, 5], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconCreateFunction: (c: any) =>
          L.divIcon({
            html: `<div>${c.getChildCount()}</div>`,
            className: 'marker-cluster-slop',
            iconSize: L.point(40, 40),
          }),
      });
      map.addLayer(cluster);

      mapRef.current = map;
      clusterRef.current = cluster;
      renderMarkers();
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        clusterRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers whenever the filtered data changes.
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  return <div ref={elRef} className="h-full w-full" />;
}
