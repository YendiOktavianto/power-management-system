"use client";

import { useCallback, useEffect, MutableRefObject } from "react";
import type { Location } from "@/app/(app)/dashboard/types"; // sesuaikan path types-mu

export function useMapOnLoad(
  locations: Location[],
  center: google.maps.LatLngLiteral,
  setZoom: (z: number) => void,
  mapRef: MutableRefObject<google.maps.Map | null>
) {
  return useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (locations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        for (const loc of locations) bounds.extend({ lat: loc.lat, lng: loc.lng });
        map.fitBounds(bounds);
      } else {
        map.setCenter(center); // center sudah diurus hook
        map.setZoom(locations.length === 1 ? 14 : 11);
      }

      map.addListener("zoom_changed", () => {
        const z = map.getZoom();
        if (typeof z === "number") setZoom(z);
      });
    },
    [locations, center, setZoom, mapRef]
  );
}

export function useFollowCenterOnChange(
  mapRef: MutableRefObject<google.maps.Map | null>,
  center: google.maps.LatLngLiteral,
  locationsLen: number
) {
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
      if (locationsLen === 0) mapRef.current.setZoom(11);
      else if (locationsLen === 1) mapRef.current.setZoom(14);
    }
  }, [center, locationsLen, mapRef]);
}
