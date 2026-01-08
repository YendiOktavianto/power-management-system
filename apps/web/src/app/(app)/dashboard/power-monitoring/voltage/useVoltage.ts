"use client";

import { useEffect, useState } from "react";
import { useLatestPolling } from "../useLatest";
import { SAMPLE_MS, MAX_POINTS } from "./constants";

// device.id = numeric (hasil map dari /monitoring-info/mine)
// device.device_id (string) tetap boleh, kita pakai sebagai fallback.
type Dev = { id?: number; device_id?: number | string };

export default function useVoltageSection({
  device,
  paused,
}: {
  device?: Dev;
  paused?: boolean;
}) {
  const numericId =
    typeof device?.id === "number" && Number.isFinite(device.id)
      ? device.id
      : Number.isFinite(Number(device?.device_id))
      ? Number(device?.device_id)
      : undefined;

  // polling ke /monitoring-info/latest/:id
  const { mapped } = useLatestPolling(numericId, SAMPLE_MS, !paused);

  const [voltage, setVoltage] = useState(0);
  const [data, setData] = useState<{ time: string; voltage: number }[]>([]);

  // reset saat ganti device
  useEffect(() => {
    setVoltage(0);
    setData([]);
  }, [numericId]);

  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.voltage;

    // kalau null/NaN → pakai last value biar garis nggak “jatuh” ke 0
    if (raw == null || !Number.isFinite(raw)) {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.voltage ?? 0;
        return [...prev, { time: mapped.timeLabel, voltage: lastVal }].slice(
          -MAX_POINTS
        );
      });
      return;
    }

    const v = Math.max(0, Math.round(raw));

    setVoltage(v);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, voltage: v }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  return { voltage, data };
}
