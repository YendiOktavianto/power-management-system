// ../validation.ts

import {
  ANGLE_RANGE,
  MAX_VAL,
  MIN_VAL,
  START_ANGLE,
  V_RED_YELLOW_START,
  V_YELLOW_LIME_START,
  V_LIME_YELLOW_END,
  V_YELLOW_RED_END,
} from "./constants";
import type { VoltagePoint, SegmentedVoltagePoint } from "./types";

/** Polar → Cartesian untuk SVG */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG Arc path dari sudut start→end (deg) */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return [
    "M",
    startPt.x,
    startPt.y,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    endPt.x,
    endPt.y,
  ].join(" ");
}

/** Sudut jarum dari nilai */
export function needleAngleFromValue(val: number) {
  const pct = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}

/** Sudut untuk nilai tertentu pada gauge */
export function angleForValue(v: number) {
  const pct = (v - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}

/**
 * Segmentasi data voltage jadi 3 field (red / yellow / lime)
 * supaya line chart bisa diwarnai sama seperti gauge.
 */
export function segmentVoltageData(
  data: VoltagePoint[]
): SegmentedVoltagePoint[] {
  return data.map((p) => {
    const v = p.voltage;

    if (v == null || Number.isNaN(v)) {
      return {
        time: p.time,
        voltage: null,
        red: null,
        yellow: null,
        lime: null,
      };
    }

    let red: number | null = null;
    let yellow: number | null = null;
    let lime: number | null = null;

    if (v < V_RED_YELLOW_START || v > V_YELLOW_RED_END) {
      // merah: di luar zona kuning + hijau
      red = v;
    } else if (v < V_YELLOW_LIME_START || v > V_LIME_YELLOW_END) {
      // kuning: "pinggir" sebelum & sesudah hijau
      yellow = v;
    } else {
      // hijau: tengah (normal)
      lime = v;
    }

    // PENTING: simpan voltage asli juga, buat 1 garis utama yang halus
    return {
      time: p.time,
      voltage: v,
      red,
      yellow,
      lime,
    };
  });
}
