// app/(app)/dashboard/_components/useMapHelpers.ts
"use client";

import { useCallback, useEffect, MutableRefObject } from "react";
import type { SiteLocationMarker as Location } from "../types";

export function useMapOnLoad(
  _locations: Location[], // sekarang cuma buat dependency
  _center: google.maps.LatLngLiteral,
  setZoom: (z: number) => void,
  setUserTouched: (v: boolean) => void,
  mapRef: MutableRefObject<google.maps.Map | null>,
) {
  return useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // ⛔️ TIDAK lagi setZoom / fitBounds di sini
      // Zoom & center diatur dari props <GoogleMap zoom / center>

      // listen ketika user zoom manual
      map.addListener("zoom_changed", () => {
        const z = map.getZoom();
        if (typeof z === "number") {
          setZoom(z);
          setUserTouched(true);
        }
      });

      // listen ketika user drag map
      map.addListener("dragstart", () => {
        setUserTouched(true);
      });
    },
    [setZoom, setUserTouched, mapRef],
  );
}

export function useFollowCenterOnChange(
  mapRef: MutableRefObject<google.maps.Map | null>,
  center: google.maps.LatLngLiteral,
  _locationsLen: number,
  userTouched: boolean,
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // kalau user sudah gerakin map, jangan paksa ubah lagi
    if (userTouched) return;

    // cuma geser ke center baru, zoom biarkan dari state
    map.panTo(center);
  }, [center, userTouched, mapRef]);
}
