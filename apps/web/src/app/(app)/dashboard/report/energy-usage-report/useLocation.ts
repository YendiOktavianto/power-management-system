// apps/web/src/app/(reports)/energy-usage/useLocations.ts
"use client";

import { useEffect, useState } from "react";
import { API_MY_DEVICES } from "./constants";
import { authHeaders } from "../api";

export interface LocationOption {
  id: string;   // deviceId (string)
  name: string; // label yang ditampilkan di dropdown
}

export function useLocations() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_MY_DEVICES, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setLocations([]);
          return;
        }

        const text = await res.text().catch(() => "");
        if (!text.trim()) {
          setLocations([]);
          return;
        }

        const json = JSON.parse(text);

        const mapped: LocationOption[] = (json || []).map((item: any) => ({
          id: String(item.device_id ?? item.id),
          name:
            item.address_name ??
            item.location_name ??
            item.location?.address?.address_name ??
            item.device_name ??
            `Device ${item.device_id ?? item.id}`,
        }));

        setLocations(mapped);
      } catch {
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { locations, loading };
}
