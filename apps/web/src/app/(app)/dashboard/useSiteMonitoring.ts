"use client";

import { useEffect, useRef, useState } from "react";
import { LOCATIONS_API, DEFAULT_CENTER } from "./constants";
import type { Center, BackendLocationDto, SiteLocationMarker } from "./types";

const EMPTY_ZOOM = 11;
const SINGLE_ZOOM = 14;
const REFRESH_MS = 1000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceKm(a: SiteLocationMarker, b: SiteLocationMarker): number {
  const R = 6371;

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
    zoom = 15;
  } else if (maxKm < 1) {
    zoom = 14;
  } else if (maxKm < 3) {
    zoom = 13;
  } else if (maxKm < 7) {
    zoom = 12;
  } else if (maxKm < 15) {
    zoom = 11;
  } else if (maxKm < 40) {
    zoom = 10;
  } else if (maxKm < 150) {
    zoom = 9;
  } else if (maxKm < 400) {
    zoom = 8;
  } else if (maxKm < 900) {
    zoom = 7;
  } else if (maxKm < 2000) {
    zoom = 6;
  } else {
    zoom = 5;
  }

  zoom = Math.min(zoom, SINGLE_ZOOM - 1);
  zoom = Math.max(5, zoom);
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
    let stopped = false;

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

        const url = `${LOCATIONS_API}/listForMe`;
        const res = await fetch(url, {
          credentials: "include",
          signal: ac.signal,
        });

        console.debug("[SiteMonitoring] URL:", res.url, "status:", res.status);

        if (res.status === 401 || res.status === 403 || res.status === 404) {
          console.warn("[SiteMonitoring] auth expired, redirecting to /login");
          stopped = true;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          try {
            const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
            const domainPart = domain ? ` Domain=${domain};` : "";
            const sameSitePart = domain ? " SameSite=None;" : " SameSite=Lax;";
            const securePart = domain ? " Secure;" : "";
            document.cookie = `role=; Path=/; Max-Age=0;${domainPart}${sameSitePart}${securePart}`;
          } catch {}
          redirectToLoginFromClient();
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
          serial_number: d.serialNumber ?? "",
        }));

        console.debug(
          "[SiteMonitoring] mapped markers:",
          mapped.length,
          mapped.slice(0, 2),
        );

        setLocations(mapped);

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

        setCenter((prev) => {
          if (!prev) return nextCenter;

          const dLat = Math.abs(prev.lat - nextCenter.lat);
          const dLng = Math.abs(prev.lng - nextCenter.lng);

          if (dLat < 1e-6 && dLng < 1e-6) {
            return prev;
          }
          return nextCenter;
        });

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
      if (!isMounted || stopped) return;

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
