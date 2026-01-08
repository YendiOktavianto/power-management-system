"use client";
import { useEffect, useRef, useState } from "react";
import { fetchLatest, type LatestRow } from "./api";

// const DBG = true;

const pick = (o: any, keys: string[], d: number | null = null) => {
  for (const k of keys) {
    const v = o?.[k];
    const n = Number(v);
    if (v !== undefined && v !== null && Number.isFinite(n)) return n;
  }
  return d;
};

export type LatestMapped = {
  timeLabel: string;
  voltage: number | null;
  current: number | null;
  frequency: number | null;
  power: number | null;
  powerFactor: number | null;
  energyTotal: number | null;
};

export function useLatestPolling(
  deviceId?: number,
  sampleMs = 2000,
  enabled = true
) {
  const [mapped, setMapped] = useState<LatestMapped | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // simpan row terakhir yang sudah kita proses
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // clear setiap ganti device / setting
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMapped(null);
    lastKeyRef.current = null; // reset juga kunci row terakhir

    if (!deviceId || !enabled) return;

    const tick = async () => {
      const row = await fetchLatest(deviceId);

      // kalau null/undefined/{} → anggap gak ada data baru
      if (!row || Object.keys(row).length === 0) return;

      // pakai kombinasi date + time dari backend sebagai penanda “row baru”
      const key = `${row.date ?? ""}T${row.time ?? ""}`;
      if (key && lastKeyRef.current === key) {
        // masih row yang sama → jangan update mapped supaya chart gak terus nambah titik
        return;
      }
      lastKeyRef.current = key;

      // kalau mau, kamu juga bisa pakai row.time untuk label,
      // bukan jam local FE, biar konsisten
      const t =
        row.time ??
        new Date().toLocaleTimeString("id-ID", { hour12: false });

      setMapped({
        timeLabel: t,
        voltage: pick(row, ["voltage", "VRN", "v_rn", "voltage_rn", "avg_voltage"], null),
        current: pick(row, ["current", "IR", "i_r", "current_r", "avg_current"], null),
        frequency: pick(row, ["frequency", "freq", "hz"], null),
        power: pick(row, ["power", "real_power", "active_power", "p", "kw"], null),
        powerFactor: pick(row, ["power_factor", "power_facto", "pf", "cosphi"], null),
        energyTotal: pick(
          row,
          ["total_energy_usage", "energy_usage_total", "energy_usage_all_time"],
          null
        ),
      });
    };

    tick();
    intervalRef.current = setInterval(tick, sampleMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deviceId, sampleMs, enabled]);

  return { mapped };
}
