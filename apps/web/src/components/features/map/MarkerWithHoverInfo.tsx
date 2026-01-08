"use client";

import { Marker, InfoWindow } from "@react-google-maps/api";
import { memo } from "react";

export type LocationLike = {
  id: string;
  lat: number;
  lng: number;
  address_name?: string;
  detail_address?: string;
  device_id?: string;
  segment?: string;
  isActive?: boolean;
};

type Props = {
  loc: LocationLike;
  zoom: number;
  hoveredId: string | null;
  setHovered: (loc: LocationLike | null) => void;
};

function MarkerWithHoverInfoImpl({ loc, zoom, hoveredId, setHovered }: Props) {
  return (
    <Marker
      key={loc.id}
      position={{ lat: loc.lat, lng: loc.lng }}
      onMouseOver={() => setHovered(loc)}
      onMouseOut={() => setHovered(null)}
      icon={{
        url: loc.isActive ? "/active.svg" : "/nonactive.svg",
        scaledSize: new google.maps.Size(zoom * 5, zoom * 5),
        anchor: new google.maps.Point((zoom * 4) / 2, (zoom * 4) / 2),
      }}
    >
      {hoveredId === loc.id && (
        <InfoWindow
          position={{ lat: loc.lat, lng: loc.lng }}
          options={{ disableAutoPan: false }}
        >
          <div className="text-[12px] ">
            <strong className="text-blue-700">
              <p className="truncate max-w-[190px] mb-2" title={loc.detail_address}>
                📍 {loc.address_name}
              </p>
            </strong>
            <p className="text-gray-800 ">Device ID     : {loc.device_id || "-"}</p>
            <p className="text-gray-800 ">Detail Address: {loc.detail_address || "-"}</p>
            <p className="text-gray-800 ">Segment       : {loc.segment || "-"}</p>
            <p className="text-gray-800 ">
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

export const MarkerWithHoverInfo = memo(MarkerWithHoverInfoImpl);
