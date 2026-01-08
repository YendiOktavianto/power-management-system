"use client";
import { useEffect, useState } from "react";
import { useLatestPolling } from "../useLatest";
import { SAMPLE_MS, MAX_POINTS } from "./constants";

type Dev = { id?: number; device_id?: string | number };

export default function usePowerSection({
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

  const [power, setPower] = useState(0);
  const [data, setData] = useState<{ time: string; power: number }[]>([]);

  // reset saat ganti device
  useEffect(() => {
    setPower(0);
    setData([]);
  }, [numericId]);

  // update dari BE
  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.power;

    if (raw == null || !Number.isFinite(raw)) {
      // kalau null/NaN → pakai last value
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.power ?? 0;
        return [
          ...prev,
          { time: mapped.timeLabel, power: lastVal },
        ].slice(-MAX_POINTS);
      });
      return;
    }

    const p = Math.max(0, raw); // minimal 0

    setPower(p);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, power: p }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  return { power, data };
}
