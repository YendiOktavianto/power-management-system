"use client";
import { useEffect, useState } from "react";
import { MAX_POINTS, SAMPLE_MS } from "./constants";
import { useLatestPolling } from "../useLatest";

type Dev = { id?: number; device_id?: string | number };

export default function useEnergyUsageSection({
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

  const [energyTotal, setEnergy] = useState(0);
  const [data, setData] = useState<{ time: string; energy: number }[]>([]);

  // reset saat ganti device
  useEffect(() => {
    setEnergy(0);
    setData([]);
  }, [numericId]);

  // update dari BE
  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.energyTotal;

    if (raw == null || !Number.isFinite(raw)) {
      // kalau null/NaN → pakai last value
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.energy ?? 0;
        return [
          ...prev,
          { time: mapped.timeLabel, energy: lastVal },
        ].slice(-MAX_POINTS);
      });
      return;
    }

    const e = Math.max(0, raw); // total energy minimal 0

    setEnergy(e);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, energy: e }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  return { energyTotal, data };
}
