// app/(app)/dashboard/useSiteMonitoring.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { LOCATIONS_API, DEFAULT_CENTER } from "./constants";
import type { Center, BackendLocationDto, SiteLocationMarker } from "./types";

const EMPTY_ZOOM = 11; // kalau gak ada lokasi
const SINGLE_ZOOM = 14; // zoom untuk 1 marker
const REFRESH_MS = 1000; // misal 10 detik (boleh kamu ganti)

// helper: konversi derajat → radian
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// helper: jarak 2 titik (km) pakai haversine
function distanceKm(a: SiteLocationMarker, b: SiteLocationMarker): number {
  const R = 6371; // radius bumi (km)

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c; // km
}

// Hitung zoom fleksibel untuk >1 marker berdasarkan jarak terjauh antar marker
function computeZoomForMarkers(mapped: SiteLocationMarker[]): number {
  if (mapped.length <= 1) return SINGLE_ZOOM;

  let maxKm = 0;
  for (let i = 0; i < mapped.length; i++) {
    for (let j = i + 1; j < mapped.length; j++) {
      const d = distanceKm(mapped[i], mapped[j]);
      if (d > maxKm) maxKm = d;
    }
  }

  let zoom: number;

  if (maxKm < 0.3) {
    zoom = 15;      // < 300 m (kompleks kecil)
  } else if (maxKm < 1) {
    zoom = 14;      // < 1 km
  } else if (maxKm < 3) {
    zoom = 13;      // < 3 km (1 kelurahan)
  } else if (maxKm < 7) {
    zoom = 12;      // < 7 km (kecamatan)
  } else if (maxKm < 15) {
    zoom = 11;      // < 15 km (kota kecil)
  } else if (maxKm < 40) {
    zoom = 10;      // < 40 km (kabupaten)
  } else if (maxKm < 150) {
    zoom = 9;       // < 150 km (antar-kota/prov deket)
  } else if (maxKm < 400) {
    zoom = 8;       // < 400 km (Jawa–Sumatra deket)
  } else if (maxKm < 900) {
    zoom = 7;       // < 900 km (beda pulau tapi masih 1 cluster)
  } else if (maxKm < 2000) {
    zoom = 6;       // < 2000 km (sebagian besar Indonesia)
  } else {
    zoom = 5;       // > 2000 km (super jauh, lintas negara)
  }

  // multi-marker jangan lebih dekat dari single-marker
  zoom = Math.min(zoom, SINGLE_ZOOM - 1);

  // batas bawah: boleh sampai level negara
  zoom = Math.max(5, zoom); // ⬅️ dulu 8, sekarang 5 biar bisa jauh

  return zoom;
}

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export function useSiteMonitoring() {
  const [locations, setLocations] = useState<SiteLocationMarker[]>([]);
  const [center, setCenter] = useState<Center>(DEFAULT_CENTER);
  const [initialZoom, setInitialZoom] = useState<number>(EMPTY_ZOOM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    // batalkan request & timer sebelumnya (misal karena hot reload)
    abortRef.current?.abort();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const ac = new AbortController();
    abortRef.current = ac;

    const fetchOnce = async () => {
      try {
        if (!isMounted) return;

        setIsLoading(true);
        setError(null);

        const res = await fetch(`${LOCATIONS_API}/listAll`, {
          credentials: "include",
          signal: ac.signal,
        });

        console.debug("[SiteMonitoring] URL:", res.url, "status:", res.status);

        if (res.status === 401) {
          console.warn("[SiteMonitoring] 401 – redirecting to /login");
          redirectToLoginFromClient();
          // reset state seperlunya
          if (!isMounted) return;
          setLocations([]);
          setCenter(DEFAULT_CENTER);
          setInitialZoom(EMPTY_ZOOM);
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`${res.status} ${res.statusText} ${txt}`);
        }

        const data: BackendLocationDto[] = await res.json();
        if (!isMounted) return;

        const mapped: SiteLocationMarker[] = data.map((d) => ({
          id: d.deviceId,
          lat: d.latitude ?? DEFAULT_CENTER.lat,
          lng: d.longitude ?? DEFAULT_CENTER.lng,
          addressName: d.addressName ?? "",
          detailAddressName: d.detailAddressName ?? "",
          segment: d.segment ?? "",
          isActive: d.status === "Active",
          username: d.username ?? "",
          serialNumber: d.serialNumber ?? "",
        }));

        console.debug(
          "[SiteMonitoring] mapped markers:",
          mapped.length,
          mapped.slice(0, 2),
        );

        setLocations((prev) => {
          const same =
            prev.length === mapped.length &&
            JSON.stringify(prev) === JSON.stringify(mapped);
          return same ? prev : mapped;
        });

        // Hitung center & zoom target
        let nextCenter = DEFAULT_CENTER;
        let nextZoom = EMPTY_ZOOM;

        if (mapped.length === 1) {
          nextCenter = { lat: mapped[0].lat, lng: mapped[0].lng };
          nextZoom = SINGLE_ZOOM;
        } else if (mapped.length > 1) {
          const lats = mapped.map((l) => l.lat);
          const lngs = mapped.map((l) => l.lng);
          nextCenter = {
            lat: (Math.min(...lats) + Math.max(...lats)) / 2,
            lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
          };
          nextZoom = computeZoomForMarkers(mapped);
        }

        // update center hanya kalau beda secara numerik (menghindari jitter)
        setCenter((prev) => {
          if (!prev) return nextCenter;
          const dLat = Math.abs(prev.lat - nextCenter.lat);
          const dLng = Math.abs(prev.lng - nextCenter.lng);
          if (dLat < 1e-6 && dLng < 1e-6) return prev;
          return nextCenter;
        });

        // initialZoom kalau beda
        setInitialZoom((prev) => (prev === nextZoom ? prev : nextZoom));
      } catch (e: any) {
        if (!isMounted || e?.name === "AbortError") return;

        console.error("[SiteMonitoring] fetch error:", e);
        setError(e?.message ?? "Failed to load locations");
        setLocations([]);
        setCenter(DEFAULT_CENTER);
        setInitialZoom(EMPTY_ZOOM);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    const loop = async () => {
      await fetchOnce();
      if (!isMounted) return;
      timerRef.current = setTimeout(loop, REFRESH_MS);
    };

    void loop();

    return () => {
      isMounted = false;
      ac.abort();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { locations, center, initialZoom, isLoading, error };
}
