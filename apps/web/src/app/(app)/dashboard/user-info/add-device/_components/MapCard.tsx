// app/(app)/dashboard/user-info/add-device/components/MapCard.tsx
"use client";

import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { INFO_CARD_BG } from "@/components/ui/theme";

export default function MapCard({
  form,
  setForm,
  markerEdited,
  setMarkerEdited,
  zoom,
  setZoom,
}: {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  markerEdited: boolean;
  setMarkerEdited: (v: boolean) => void;
  zoom: number;
  setZoom: (n: number) => void;
}) {
  
  return (
    <section
      className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 backdrop-blur-md p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
      style={{ background: INFO_CARD_BG }}
      aria-label="Map selector"
    >
      <div className="h-64 md:h-[350px] rounded-xl overflow-hidden ring-1 ring-white/10">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={{ lat: form.lat, lng: form.lng }}
          zoom={zoom}
          onClick={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setMarkerEdited(true);
              setForm((prev) => ({ ...prev, lat, lng }));
            }
          }}
        >
          {form.province_id && form.city_id && form.district_id && form.subdistrict_id && (
            <Marker
              position={{ lat: form.lat, lng: form.lng }}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarkerEdited(true);
                  setForm((prev) => ({ ...prev, lat, lng }));
                }
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-white/70">
        <p className="font-medium">⚠️ Ensure marker is accurate before submitting.</p>
        <code className="px-2 py-1 rounded-lg border border-white/10 bg-white/5">
          {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
        </code>
      </div>
    </section>
  );
}
