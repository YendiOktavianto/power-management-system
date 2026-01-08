// app/(dashboard)/dashboard/power-monitoring/power-factor/usePowerFactorSection.ts
"use client";

import { useEffect, useState } from "react";
import { MAX_POINTS, SAMPLE_MS } from "./constants";
import type { PFPoint } from "./types";
import { useLatestPolling } from "../useLatest";

type Dev = { id?: number; device_id?: number | string };

/**
 * Menangani state powerFactor & data historis, reset saat device berganti.
 */
export default function usePowerFactorSection({
  device,
  paused,
}: { device?: Dev; paused?: boolean }) {
  const numericId =
    typeof device?.id === "number" && Number.isFinite(device.id)
      ? device.id
      : Number.isFinite(Number(device?.device_id))
      ? Number(device?.device_id)
      : undefined;

  const { mapped } = useLatestPolling(numericId, SAMPLE_MS, !paused);

  const [powerFactor, setPF] = useState(0);
  const [data, setData] = useState<PFPoint[]>([]);

  // reset saat ganti device
  useEffect(() => {
    setPF(0);
    setData([]);
  }, [numericId]);

  // update dari BE
  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.powerFactor;

    if (raw == null || !Number.isFinite(raw)) {
      // kalau null/NaN → pakai last value
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.powerFactor ?? 0;
        return [
          ...prev,
          { time: mapped.timeLabel, powerFactor: lastVal },
        ].slice(-MAX_POINTS);
      });
      return;
    }

    // clamp pf ke 0..1
    const pf = Math.min(1, Math.max(0, raw));

    setPF(pf);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, powerFactor: pf }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  return { powerFactor, data };
}
