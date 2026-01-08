"use client";

import { useEffect, useState } from "react";
import { API_MY_DEVICES } from "./constants";
import { authHeaders } from "../api";

// Tipe data untuk 1 opsi location di dropdown
export interface LocationOption {
  id: string;   // deviceId (string)
  name: string; // teks yang ditampilkan di dropdown
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
          // value select → deviceId (string)
          id: String(item.device_id ?? item.id),
          // label select → kombinasi yang paling masuk akal
          name:
            item.address_name ??
            item.location_name ??
            item.location?.address?.address_name ??
            item.device_name ??
            `Device ${item.device_id ?? item.id}`,
        }));

        setLocations(mapped);
      } catch (err) {
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { locations, loading };
}
