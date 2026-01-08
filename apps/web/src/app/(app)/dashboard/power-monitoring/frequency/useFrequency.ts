"use client";
import { useEffect, useState } from "react";
import { useLatestPolling } from "../useLatest";
import { SAMPLE_MS, MAX_POINTS } from "./constants";
import type { FrequencyPoint } from "./types";

type Dev = { id?: number; device_id?: number | string };

export default function useFrequencySection({
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

  const [frequency, setFrequency] = useState(0);
  const [data, setData] = useState<FrequencyPoint[]>([]);

  // reset saat ganti device
  useEffect(() => {
    setFrequency(0);
    setData([]);
  }, [numericId]);

  // update dari BE
  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.frequency;

    if (raw == null || !Number.isFinite(raw)) {
      // kalau null/NaN → pakai last value
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.frequency ?? 0;
        return [
          ...prev,
          { time: mapped.timeLabel, frequency: lastVal },
        ].slice(-MAX_POINTS);
      });
      return;
    }

    const f = Math.max(0, raw); // minimal 0 Hz

    setFrequency(f);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, frequency: f }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  return { frequency, data };
}
