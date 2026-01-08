// app/(app)/dashboard/page.tsx  (Site Monitoring page)
"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSiteMonitoring } from "./useSiteMonitoring";
import type { SiteLocationMarker } from "./types";
import { DEFAULT_CENTER } from "./constants";
import MapContainer from "./_components/MapContainer";
import MarkersLayer from "./_components/MarkerLayer";
import { GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";
import {
  useMapOnLoad,
  useFollowCenterOnChange,
} from "./_components/useMapHelpers";

const EMPTY_ZOOM = 11; 

export default function SiteMonitoring() {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const {
    locations,
    center,
    initialZoom,
    isLoading,
    error,
  } = useSiteMonitoring();

  const [zoom, setZoom] = useState<number>(EMPTY_ZOOM);
  const [hovered, setHovered] = useState<SiteLocationMarker | null>(null);
  const [userTouched, setUserTouched] = useState(false); // user sudah gerak/zoom map?
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (typeof initialZoom === "number" && !userTouched) {
      setZoom(initialZoom);
    }
  }, [initialZoom, userTouched]);

  const onLoad = useMapOnLoad(
    locations,
    center ?? DEFAULT_CENTER,
    setZoom,
    setUserTouched,
    mapRef,
  );

  useFollowCenterOnChange(
    mapRef,
    center ?? DEFAULT_CENTER,
    locations.length,
    userTouched,
  );

  const handleMarkerClick = (loc: SiteLocationMarker) => {
    router.push(`./device-management`);
  };

  if (!isLoaded) {
    return <div className="text-white text-center mt-10">Loading Maps...</div>;
  }

  return (
    <MapContainer>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center ?? DEFAULT_CENTER}
        zoom={zoom}
        onLoad={onLoad}
      >
        <MarkersLayer
          locations={locations}
          zoom={zoom}
          hovered={hovered}
          setHovered={setHovered}
          onMarkerClick={handleMarkerClick}
        />
      </GoogleMap>
    </MapContainer>
  );
}
