"use client";

import { useEffect, useRef } from "react";

// CRMA campus center coordinates (Nakhon Nayok)
const CRMA_LAT = 14.0021;
const CRMA_LNG = 101.0678;
const DEFAULT_ZOOM = 17;

export type PinLocation = {
  lat: number;
  lng: number;
  label?: string;
};

type Props = {
  value: PinLocation | null;
  onChange: (loc: PinLocation) => void;
  height?: number;
};

export function CampusPinMap({ value, onChange, height = 240 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import — Leaflet is client-only
    import("leaflet").then(L => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [CRMA_LAT, CRMA_LNG],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // If initial value, place marker
      if (value) {
        const m = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
        m.on("dragend", () => {
          const pos = m.getLatLng();
          onChange({ lat: pos.lat, lng: pos.lng });
        });
        markerRef.current = m;
        map.setView([value.lat, value.lng], DEFAULT_ZOOM);
      }

      // Click to place / move marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const m = L.marker([lat, lng], { draggable: true }).addTo(map);
          m.on("dragend", () => {
            const pos = m.getLatLng();
            onChange({ lat: pos.lat, lng: pos.lng });
          });
          markerRef.current = m;
        }
        onChange({ lat, lng });
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current  = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value → marker position (initial mount only)
  useEffect(() => {
    if (!mapRef.current || !value) return;
    import("leaflet").then(L => {
      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lng]);
      } else {
        const m = L.marker([value.lat, value.lng], { draggable: true }).addTo(mapRef.current!);
        m.on("dragend", () => {
          const pos = m.getLatLng();
          onChange({ lat: pos.lat, lng: pos.lng });
        });
        markerRef.current = m;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  return (
    <>
      {/* Leaflet CSS — loaded once */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={containerRef}
        style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", zIndex: 0 }}
      />
    </>
  );
}
