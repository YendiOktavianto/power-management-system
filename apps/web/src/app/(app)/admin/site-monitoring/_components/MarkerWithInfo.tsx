// app/(app)/dashboard/_components/MarkerWithInfo.tsx
"use client";

import { Marker, InfoWindow } from "@react-google-maps/api";
import type { SiteLocationMarker } from "../types";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  loc: SiteLocationMarker;
  zoom: number;
  hovered: SiteLocationMarker | null;
  setHovered: Dispatch<SetStateAction<SiteLocationMarker | null>>;
  onMarkerClick?: (loc: SiteLocationMarker) => void;
};

export default function MarkerWithInfo({
  loc,
  zoom,
  hovered,
  setHovered,
  onMarkerClick,
}: Props) {
  let size = 60; // default

  if (zoom <= 9) {
    size = 50;
  } else if (zoom <= 11) {
    size = 72;
  } else if (zoom <= 13) {
    size = 64;
  } else {
    size = 60;
  }

  return (
    <Marker
      position={{ lat: loc.lat, lng: loc.lng }}
      onMouseOver={() => setHovered(loc)}
      onMouseOut={() => setHovered(null)}
      onClick={() => onMarkerClick?.(loc)}
      icon={{
        url: loc.isActive ? "/active.svg" : "/nonactive.svg",
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      }}
    >
      {hovered && hovered.id === loc.id && (
        <InfoWindow
          position={{ lat: loc.lat, lng: loc.lng }}
          options={{ disableAutoPan: false }}
        >
          <div className="text-[12px]">
            <strong className="text-blue-700">
              <p
                className="mb-2 max-w-[190px] truncate"
                title={loc.detailAddressName}
              >
                📍 {loc.addressName}
              </p>
            </strong>
            <p className="text-gray-800">
              Serial Number : {loc.serialNumber || "-"}
            </p>
            <p className="text-gray-800">
              User / Owner : {loc.username || "-"}
            </p>
            <p className="text-gray-800">Device ID : {loc.id || "-"}</p>
            <p className="text-gray-800">
              Detail Address: {loc.detailAddressName || "-"}
            </p>
            <p className="text-gray-800">Segment : {loc.segment || "-"}</p>
            <p className="text-gray-800">
              Status:{" "}
              <span className={loc.isActive ? "text-green-600" : "text-red-600"}>
                {loc.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}
