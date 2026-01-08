"use client";

import { useEffect, useState } from "react";
import {
  MAX_POINTS,
  SAMPLE_MS,
  MAX_CURRENT,
  MIN_CURRENT,
  ANGLE_RANGE,
  START_ANGLE,
} from "./constants";
import type { CurrentPoint } from "./types";
import { useLatestPolling } from "../useLatest";

type Dev = { id?: number; device_id?: number | string };

export default function useCurrentSection({
  device,
  paused,
}: {
  device?: Dev;
  paused?: boolean;
}) {
  // id numerik utk /monitoring-info/latest/:id
  const numericId =
    typeof device?.id === "number" && Number.isFinite(device.id)
      ? device.id
      : Number.isFinite(Number(device?.device_id))
      ? Number(device?.device_id)
      : undefined;

  // polling data terbaru
  const { mapped } = useLatestPolling(numericId, SAMPLE_MS, !paused);

  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<CurrentPoint[]>([]);

  // reset saat device berganti
  useEffect(() => {
    setCurrent(0);
    setData([]);
  }, [numericId]);

  // update dari payload BE
  useEffect(() => {
    if (!mapped) return;

    const raw = mapped.current;

    if (raw == null || !Number.isFinite(raw)) {
      // kalau null/NaN → pakai last value
      setData((prev) => {
        const last = prev[prev.length - 1];
        const lastVal = last?.current ?? 0;
        return [...prev, { time: mapped.timeLabel, current: lastVal }].slice(
          -MAX_POINTS
        );
      });
      return;
    }

    const clamped = Math.min(MAX_CURRENT, Math.max(MIN_CURRENT, raw));

    setCurrent(clamped);
    setData((prev) =>
      [...prev, { time: mapped.timeLabel, current: clamped }].slice(-MAX_POINTS)
    );
  }, [mapped]);

  // sudut jarum
  const pctRaw = (current - MIN_CURRENT) / (MAX_CURRENT - MIN_CURRENT); // 0..1
  const pct = Math.max(0, Math.min(1, Number.isFinite(pctRaw) ? pctRaw : 0));
  const needleAngle = START_ANGLE + pct * ANGLE_RANGE;

  return { current, data, needleAngle };
}
