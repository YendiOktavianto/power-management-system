// apps/web/src/app/(app)/dashboard/useDashboard.ts
"use client";

import { useState, useEffect } from "react";
import type { Device } from "./types";
import { API_MY_DEVICES, API_HOME } from "./constants";
import { authHeaders } from "./api";

type HomeSnapshot = {
  device: {
    deviceId: number;
    serialNumber?: string | null;
    wattagePhase?: string | null;
    wattagephase?: string | null; // jaga-jaga kalau lowercase
    segment?: string | null;
    location?: string | null;
    address_name?: string | null;
  };
  metrics: {
    voltage: string | number | null;
    frequency_hz: string | number | null;
    power_watt: string | number | null;
    current_ampere: string | number | null;
    power_factor: string | number | null;
    energy_kwh: {
      today: string | number | null;
      mtd: string | number | null;
    };
    cost_idr: {
      today: string | number | null;
      mtd: string | number | null;
    };
  };
  lastUpdate: string | null;
};

function toNumber(
  value: string | number | null | undefined,
): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, ""));
  return Number.isNaN(n) ? undefined : n;
}

// helper ID numerik (string) untuk FE ↔ BE
const getNumericId = (d: any): string | "" => {
  const raw =
    d?.deviceId ?? d?.id ?? (d as any)?.deviceid ?? d?.device_id ?? null;
  if (raw === null || raw === undefined || String(raw) === "") return "";
  return String(raw);
};

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export function useHome() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== LOAD DEVICES ==========
  useEffect(() => {
    let cancelled = false;

    const loadDevices = async () => {
      setLoadingDevices(true);
      setError(null);

      try {
        const res = await fetch(API_MY_DEVICES, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          cache: "no-store",
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
            setSelectedDeviceId("");
            setCurrentDevice(null);
            setError("Failed to load devices");
          }
          return;
        }

        const text = await res.text().catch(() => "");
        if (!text.trim()) {
          if (!cancelled) {
            console.warn("[useHome] empty response from devices API");
            setDevices([]);
            setSelectedDeviceId("");
            setCurrentDevice(null);
          }
          return;
        }

        let json: any;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("[useHome] invalid JSON from devices API:", e);
          if (!cancelled) {
            setDevices([]);
            setSelectedDeviceId("");
            setCurrentDevice(null);
            setError("Invalid devices data");
          }
          return;
        }

        const list: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
          ? json.data
          : [];

        if (!cancelled) {
          console.log("[useHome] raw devices sample", list.slice(0, 4));
        }

        const mapped: Device[] = list.map((item: any) => {
          // serial number bisa: serial_number / serialNumber / serial / serialnumber / device_id
          const serial =
            item.serial_number ??
            item.serialNumber ??
            item.serial ??
            item.serialnumber ?? // dari /locations/listAll (lowercase)
            item.device_id ??
            "";

          // wattage / phase: handle semua varian nama field
          const wattagePhase =
            item.wattagePhase ??
            item.wattagephase ?? // lowercase
            item.watt_phase ??
            item.wattage_phase ??
            item.wattage ??
            item.device?.wattagePhase ??
            item.device?.wattagephase ??
            undefined;

          // lokasi gabungan dari BE (kalau dipakai)
          const rawLocation =
            item.location ??
            item.address_name ??
            item.location_name ??
            item.addressName ??
            "";

          // address & detail (kalau BE sudah pisah)
          let address_name: string =
            item.address_name ??
            item.location_name ??
            item.addressName ??
            "";
          let detail_location: string =
            item.detail_location ?? item.detailAddressName ?? "";

          // kalau dua-duanya kosong tapi ada rawLocation → pecah "alamat - detail"
          if (!address_name && !detail_location && rawLocation) {
            const sep = " - ";
            const idx = rawLocation.lastIndexOf(sep);

            if (idx >= 0) {
              address_name = rawLocation.slice(0, idx).trim();
              detail_location = rawLocation
                .slice(idx + sep.length)
                .trim();
            } else {
              address_name = rawLocation.trim();
            }
          }

          const segment =
            item.segment ??
            item.location?.segment ??
            item.segmentName ??
            undefined;

          return {
            ...item,
            deviceId:
              item.deviceId ?? item.id ?? item.device_id ?? item.deviceid,
            id: item.id,
            device_id: String(serial || item.device_id || item.id || ""),

            serial_number: serial ? String(serial) : undefined,

            watt_phase: wattagePhase,
            wattagePhase,

            address_name,
            detail_location,
            segment,
          } as Device;
        });

        if (cancelled) return;

        setDevices(mapped);

        if (mapped.length > 0) {
          // ambil device pertama yang punya ID numerik valid
          const firstWithId =
            mapped.find((d) => getNumericId(d)) ?? mapped[0];

          const initialId = getNumericId(firstWithId);

          setSelectedDeviceId(initialId);
          setCurrentDevice(firstWithId);
        } else {
          setSelectedDeviceId("");
          setCurrentDevice(null);
        }
      } catch (err) {
        console.error("[useHome] Error fetching devices:", err);
        if (!cancelled) {
          setDevices([]);
          setSelectedDeviceId("");
          setCurrentDevice(null);
          setError("Failed to load devices");
        }
      } finally {
        if (!cancelled) {
          setLoadingDevices(false);
        }
      }
    };

    loadDevices();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========== SNAPSHOT PER DEVICE ==========
  useEffect(() => {
    if (devices.length === 0) {
      setCurrentDevice(null);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // cari selected dari devices (bisa match ke serial/ID numerik)
    const selected =
      devices.find((d) => {
        const bySerial = String(d.device_id) === selectedDeviceId;
        const byNumeric = getNumericId(d) === selectedDeviceId;
        return bySerial || byNumeric;
      }) ?? devices[0];

    let deviceIdParam = getNumericId(selected);

    // kalau masih kosong → fallback device pertama yang punya ID valid
    if (!deviceIdParam) {
      const fallback = devices.find((d) => getNumericId(d)) ?? null;

      if (!fallback) {
        setCurrentDevice(selected);
        return () => {
          cancelled = true;
          if (intervalId) clearInterval(intervalId);
        };
      }

      deviceIdParam = getNumericId(fallback);
      setSelectedDeviceId(deviceIdParam);
    }

    // deviceId untuk BE wajib numeric string
    if (!/^\d+$/.test(deviceIdParam)) {
      console.warn(
        "[useHome] skip snapshot, deviceId not numeric:",
        deviceIdParam,
      );
      setCurrentDevice(selected);
      return () => {
        cancelled = true;
        if (intervalId) clearInterval(intervalId);
      };
    }

    const loadSnapshot = async () => {
      if (cancelled) return;

      setLoadingSnapshot(true);

      try {
        const url = `${API_HOME}?deviceId=${encodeURIComponent(
          deviceIdParam,
        )}`;

        const res = await fetch(url, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn(
            "[useHome] home snapshot not ok:",
            res.status,
            res.statusText,
          );
          if (!cancelled) {
            setCurrentDevice(selected);
          }
          return;
        }

        const text = await res.text().catch(() => "");
        if (!text.trim()) {
          if (!cancelled) {
            setCurrentDevice(selected);
          }
          return;
        }

        let json: HomeSnapshot;
        try {
          json = JSON.parse(text) as HomeSnapshot;
        } catch (e) {
          console.error("[useHome] invalid JSON from home snapshot:", e);
          if (!cancelled) {
            setCurrentDevice(selected);
          }
          return;
        }

        if (cancelled) return;

        const metrics = json.metrics ?? ({} as HomeSnapshot["metrics"]);
        const devInfo = (json.device ?? {}) as any;

        const snapshotWattagePhase =
          devInfo.wattagePhase ??
          devInfo.wattagephase ??
          devInfo.watt_phase ??
          devInfo.wattage_phase ??
          devInfo.wattage ??
          undefined;

        const snapshotLocation =
          devInfo.location ??
          devInfo.address_name ??
          devInfo.addressName ??
          undefined;

        const merged: Device = {
          ...selected,

          // wattage / phase dari header snapshot
          watt_phase:
            snapshotWattagePhase ??
            selected.watt_phase ??
            (selected as any).wattagePhase ??
            undefined,
          wattagePhase:
            snapshotWattagePhase ??
            (selected as any).wattagePhase ??
            selected.watt_phase ??
            undefined,

          // serial dari header snapshot (kalau ada)
          serial_number:
            selected.serial_number ??
            devInfo.serialNumber ??
            devInfo.serial_number ??
            selected.serial_number,

          segment: selected.segment ?? devInfo.segment ?? selected.segment,

          address_name:
            selected.address_name && selected.address_name.trim() !== ""
              ? selected.address_name
              : snapshotLocation ?? selected.address_name ?? "",

          voltage: toNumber(metrics.voltage),
          current: toNumber(metrics.current_ampere),
          frequency: toNumber(metrics.frequency_hz),
          power: toNumber(metrics.power_watt),
          power_Factor: toNumber(metrics.power_factor),
          total_energy_usage_today: toNumber(
            metrics.energy_kwh?.today ?? null,
          ),
          total_energy_usage_Mtd: toNumber(
            metrics.energy_kwh?.mtd ?? null,
          ),
          total_energy_cost_today: toNumber(
            metrics.cost_idr?.today ?? null,
          ),
          total_energy_cost_mtd: toNumber(
            metrics.cost_idr?.mtd ?? null,
          ),
        };

        setCurrentDevice(merged);
      } catch (err) {
        console.error("[useHome] Error fetching home snapshot:", err);
        if (!cancelled) {
          setCurrentDevice(selected);
        }
      } finally {
        if (!cancelled) {
          setLoadingSnapshot(false);
        }
      }
    };

    // panggil sekali di awal (tetap sama seperti logika lama)
    loadSnapshot();

    // tambahan: polling berkala tiap 10 detik
    intervalId = setInterval(() => {
      loadSnapshot();
    }, 1_000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedDeviceId, devices]);

  const loading = loadingDevices || loadingSnapshot;

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    currentDevice,
    loading,
    error,
  };
}
