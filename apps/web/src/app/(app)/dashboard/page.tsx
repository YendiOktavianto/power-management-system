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
import { useSelectedDevice } from "./useSelectedDevice";

const EMPTY_ZOOM = 11; // fallback zoom awal


export default function SiteMonitoring() {
  const router = useRouter();  
  const setSelectedDeviceId = useSelectedDevice((s) => s.setDeviceId);
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
  const [userTouched, setUserTouched] = useState(false); // user sudah gerak/zoom map belum?
  const mapRef = useRef<google.maps.Map | null>(null);

  // Saat hook sudah hitung initialZoom → jadikan zoom awal
  // tapi cuma kalau user belum pernah otak-atik map (zoom / drag)
  useEffect(() => {
    if (typeof initialZoom === "number" && !userTouched) {
      setZoom(initialZoom);
    }
  }, [initialZoom, userTouched]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // sync zoom awal dari map (kalau perlu)
    const z = map.getZoom();
    if (typeof z === "number") setZoom(z);

    // update zoom state saat user zoom manual
    map.addListener("zoom_changed", () => {
      const nz = map.getZoom();
      if (typeof nz === "number") {
        setZoom(nz);
        setUserTouched(true); // user sudah ubah zoom
      }
    });

    // kalau user drag map → stop auto-follow ketat
    map.addListener("dragstart", () => {
      setUserTouched(true);
    });
  };

  const handleMarkerClick = (loc: SiteLocationMarker) => {
    setSelectedDeviceId(loc.id);  
    router.push("/dashboard/general-info"); 
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
