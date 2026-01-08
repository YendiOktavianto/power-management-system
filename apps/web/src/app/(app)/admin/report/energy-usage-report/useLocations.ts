// apps/web/src/app/(reports)/energy-usage/useLocations.ts
"use client";

import { useEffect, useState } from "react";
import { API_ADMIN_LOCATIONS } from "./constants";
import { authHeaders } from "../api";

export interface LocationOption {
  id: string;   // deviceId
  name: string; // label di UI
}

export function useLocations() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [rawDevices, setRawDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ADMIN_LOCATIONS, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setLocations([]);
          setRawDevices([]);
          return;
        }

        const text = await res.text().catch(() => "");
        if (!text.trim()) {
          setLocations([]);
          setRawDevices([]);
          return;
        }

        const json = JSON.parse(text);

        // simpan mentah buat overlay
        setRawDevices(json);

        // map jadi opsi simpel untuk label lokasi
        const mapped: LocationOption[] = (json || []).map((item: any) => ({
          id: String(item.deviceId ?? item.device_id ?? item.id),
          name:
            item.addressName ??
            item.detailAddressName ??
            item.username ??
            `Device ${item.deviceId ?? item.device_id ?? item.id}`,
        }));

        setLocations(mapped);
      } catch (err) {
        console.error("[useLocations] error:", err);
        setLocations([]);
        setRawDevices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { locations, rawDevices, loading };
}
