"use client";

import { useEffect, useMemo, useState } from "react";
import type { DeviceGeneralInfo } from "./types";
import { API_GENERAL_INFO_DEVICES, authHeaders } from "./constants";

type ListDevicesRow = {
  deviceId: number;
  serialNumber: string | null;
  wattagePhase: string | null;
  segment: string | null;
  location: string | null; // ini string gabungan: "address_name - detail_address_name"
};

// helper: pecah "alamat - detail" jadi 2 field
function splitLocation(
  location: string | null
): { addressName?: string; detailAddressName?: string } {
  if (!location) return {};

  const sep = " - ";
  const idx = location.lastIndexOf(sep);

  // kalau nggak ada separator → anggap semua sebagai addressName
  if (idx === -1) {
    const only = location.trim();
    return only ? { addressName: only } : {};
  }

  const left = location.slice(0, idx).trim(); // sebelum " - " terakhir
  const right = location.slice(idx + sep.length).trim(); // setelah " - " terakhir

  return {
    addressName: left || undefined,
    detailAddressName: right || undefined,
  };
}


type ListDevicesResponse =
  | {
      meta?: { count: number };
      data?: ListDevicesRow[];
    }
  | ListDevicesRow[];

function mapRowsToDevices(rows: ListDevicesRow[]): DeviceGeneralInfo[] {
  return rows.map((r) => {
    const { addressName, detailAddressName } = splitLocation(r.location);

    return {
      numericId: r.deviceId,
      device_id: String(r.deviceId),
      serial_number: r.serialNumber ?? String(r.deviceId),

      // string gabungan dari BE (kalau masih mau dipakai)
      location: r.location ?? undefined,

      // 🔹 dipakai overlay & overview
      address_name: addressName,
      detail_location: detailAddressName,

      wattage: r.wattagePhase ?? undefined,
      segment: r.segment ?? undefined,
    };
  });
}

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export function useGeneralInfo(_userId?: string) {
  const [devices, setDevices] = useState<DeviceGeneralInfo[]>([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(API_GENERAL_INFO_DEVICES, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
        });

      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
          if (!cancelled) {
            setDevices([]);
            setSelectedDeviceIndex(0);
          }
          return;
        }

        const json: ListDevicesResponse = await res
          .json()
          .catch(() => [] as ListDevicesRow[]);

        let rows: ListDevicesRow[] = [];
        if (Array.isArray(json)) {
          rows = json;
        } else if (json && Array.isArray(json.data)) {
          rows = json.data;
        }

        if (!cancelled) {
          const mapped = mapRowsToDevices(rows);
          setDevices(mapped);
          setSelectedDeviceIndex(mapped.length ? 0 : 0);
        }
      } catch (e) {
        console.error("Error loading general-info devices", e);
        if (!cancelled) {
          setDevices([]);
          setSelectedDeviceIndex(0);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [_userId]);

  // support ?device / ?deviceId / ?d di URL (sinkron pilihan awal)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!devices.length) return;

    const url = new URL(window.location.href);
    const qDevice =
      url.searchParams.get("device") ??
      url.searchParams.get("deviceId") ??
      url.searchParams.get("d");

    if (!qDevice) return;

    const idx = devices.findIndex(
      (d) =>
        d.device_id === qDevice ||
        d.serial_number === qDevice ||
        String(d.numericId ?? "") === qDevice
    );
    if (idx >= 0) {
      setSelectedDeviceIndex(idx);
    }
  }, [devices]);

  useEffect(() => {
    if (devices.length && selectedDeviceIndex > devices.length - 1) {
      setSelectedDeviceIndex(0);
    }
  }, [devices.length, selectedDeviceIndex]);

  const currentDevice = useMemo(
    () => (devices.length ? devices[selectedDeviceIndex] : undefined),
    [devices, selectedDeviceIndex]
  );

  return { devices, selectedDeviceIndex, setSelectedDeviceIndex, currentDevice };
}
