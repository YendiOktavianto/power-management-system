"use client";

import { GoogleMap } from "@react-google-maps/api";
import { useCallback, useEffect } from "react";
import type { LocationLike } from "./MarkerWithHoverInfo";

type Props = {
  center: { lat: number; lng: number };
  locations: LocationLike[];
  zoom: number;
  setZoom: (z: number) => void;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  containerStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

export default function MapViewport({
  center,
  locations,
  zoom,
  setZoom,
  mapRef,
  containerStyle,
  children,
}: Props) {
  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (locations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        for (const loc of locations) bounds.extend({ lat: loc.lat, lng: loc.lng });
        map.fitBounds(bounds);
      } else {
        map.setCenter(center);
        map.setZoom(locations.length === 1 ? 14 : 11);
      }

      map.addListener("zoom_changed", () => {
        const z = map.getZoom();
        if (typeof z === "number") setZoom(z);
      });
    },
    [locations, center, setZoom, mapRef]
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
      if (locations.length === 0) mapRef.current.setZoom(11);
      else if (locations.length === 1) mapRef.current.setZoom(14);
    }
  }, [center, locations.length, mapRef]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle ?? { width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
    >
      {children}
    </GoogleMap>
  );
}
