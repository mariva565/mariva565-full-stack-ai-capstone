"use client";

import { useEffect, useRef, useState } from "react";

type CityData = {
  name: string;
  lat: number;
  lng: number;
  users: number;
  courses: number;
  materials: number;
};

const MOCK_CITIES: CityData[] = [
  { name: "Sofia",           lat: 42.6977, lng: 23.3219, users: 1250, courses: 48, materials: 312 },
  { name: "Plovdiv",         lat: 42.1354, lng: 24.7453, users: 850,  courses: 32, materials: 198 },
  { name: "Varna",           lat: 43.2141, lng: 27.9147, users: 620,  courses: 24, materials: 156 },
  { name: "Burgas",          lat: 42.5048, lng: 27.4626, users: 410,  courses: 18, materials: 98  },
  { name: "Ruse",            lat: 43.8356, lng: 25.9657, users: 180,  courses: 8,  materials: 42  },
  { name: "Stara Zagora",    lat: 42.4258, lng: 25.6345, users: 320,  courses: 14, materials: 76  },
  { name: "Blagoevgrad",     lat: 42.0116, lng: 23.0979, users: 260,  courses: 12, materials: 64  },
  { name: "Veliko Tarnovo",  lat: 43.0757, lng: 25.6172, users: 190,  courses: 9,  materials: 38  },
];

const MAX_USERS = Math.max(...MOCK_CITIES.map((c) => c.users));

function getMarkerSize(users: number): number {
  const ratio = users / MAX_USERS;
  if (ratio >= 0.85) return 48;
  if (ratio >= 0.65) return 44;
  if (ratio >= 0.40) return 40;
  return 36;
}

export function NetworkMapTab() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || loaded) return;

    // Lazy-load Leaflet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    setLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loaded]);

  function initMap() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [42.7339, 25.4858],
      zoom: 7,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    const bounds: [number, number][] = [];

    MOCK_CITIES.forEach((city) => {
      const size = getMarkerSize(city.users);

      const icon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">📌</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:160px">
          <strong style="font-size:14px">${city.name}</strong>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;margin-top:8px;font-size:12px">
            <span style="color:#6b7280">Users</span><strong>${city.users.toLocaleString()}</strong>
            <span style="color:#6b7280">Courses</span><strong>${city.courses}</strong>
            <span style="color:#6b7280">Materials</span><strong>${city.materials}</strong>
          </div>
        </div>
      `);

      bounds.push([city.lat, city.lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    // Legend
    const legend = L.control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="background:rgba(255,255,255,0.95);border-radius:8px;padding:10px 14px;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:system-ui">
          <strong style="display:block;margin-bottom:6px">User Distribution</strong>
          <div style="color:#6b7280">📌 Marker size = user count</div>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb;color:#f59e0b;font-size:10px">⚠ Demonstration data</div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
  }

  return (
    <div>
      <div
        ref={mapRef}
        className="h-[500px] w-full rounded-xl border border-slate-200 dark:border-slate-700"
      />
    </div>
  );
}
