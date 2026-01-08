"use client";

import { useEffect, useState } from "react";
import { API_ADMIN_LOCATIONS } from "./constants";
import { authHeaders } from "../api";

export interface LocationOption {
  id: string;   // deviceId (string)
  name: string; // teks di UI
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

        // simpan raw buat overlay
        setRawDevices(json);

        // map ke opsi sederhana buat ditampilkan di header/filter
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
