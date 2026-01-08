// app/(app)/dashboard/_components/MarkerLayer.tsx
"use client";

import type { SiteLocationMarker } from "../types";
import type { Dispatch, SetStateAction } from "react";
import MarkerWithInfo from "./MarkerWithInfo";

type Props = {
  locations: SiteLocationMarker[];
  zoom: number;
  hovered: SiteLocationMarker | null;
  setHovered: Dispatch<SetStateAction<SiteLocationMarker | null>>;
  onMarkerClick?: (loc: SiteLocationMarker) => void;
};

export default function MarkersLayer({
  locations,
  zoom,
  hovered,
  setHovered,
  onMarkerClick,
}: Props) {
  return (
    <>
      {locations.map((loc) => (
        <MarkerWithInfo
          key={loc.id}
          loc={loc}
          zoom={zoom}
          hovered={hovered}
          setHovered={setHovered}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </>
  );
}
