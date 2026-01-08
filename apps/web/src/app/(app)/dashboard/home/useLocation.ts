// apps/web/src/app/(reports)/energy-usage/useLocations.ts
"use client";

import { useEffect, useState } from "react";
import { API_MY_DEVICES } from "./constants";
import { authHeaders } from "./api";

export interface LocationOption {
  id: string;   // deviceId numerik (string)
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
          console.warn(
            "[useLocations] devices API not ok:",
            res.status,
            res.statusText,
          );
          setLocations([]);
          return;
        }

        const text = await res.text().catch(() => "");
        if (!text.trim()) {
          console.warn("[useLocations] empty response from devices API");
          setLocations([]);
          return;
        }

        let json: any;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("[useLocations] invalid JSON from devices API:", e);
          setLocations([]);
          return;
        }

        const list: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
          ? json.data
          : [];

        const mapped: LocationOption[] = list.map((item: any) => {
          // ambil ID numerik untuk query deviceId (wajib number string)
          const rawId = item.deviceId ?? item.id ?? item.device_id;
          const id = String(rawId ?? "");

          // nama lokasi, pakai beberapa alias (snake + camel)
          const address_name =
            item.address_name ??
            item.location_name ??
            item.addressName ??
            item.location?.address?.address_name ??
            item.location?.address?.addressName ??
            item.location?.addressName ??
            item.address?.address_name ??
            item.address?.addressName ??
            "";

          const detail_address_name =
            item.detail_address_name ??
            item.detail_location ??
            item.detailAddressName ??
            item.location?.address?.detail_location ??
            item.location?.address?.address_detail ??
            item.location?.address?.detailAddressName ??
            item.location?.detailAddressName ??
            item.address?.detail_location ??
            item.address?.address_detail ??
            item.address?.detailAddressName ??
            "";

          const labelBase =
            address_name ||
            item.device_name ||
            `Device ${item.device_id ?? item.id ?? id}`;

          const name = detail_address_name
            ? `${labelBase} - ${detail_address_name}`
            : labelBase;

          return {
            id,
            name,
          };
        });

        setLocations(mapped);
      } catch (err) {
        console.error("[useLocations] Error loading locations:", err);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { locations, loading };
}
