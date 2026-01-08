// app/(dashboard)/dashboard/power-monitoring/current/validation.ts
import { ANGLE_RANGE, END_ANGLE, MAX_CURRENT, MIN_CURRENT, START_ANGLE } from "./constants";

/** Konversi polar → kartesian untuk SVG */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path arc (sudut start→end deg) */
export function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArc, 0, endPt.x, endPt.y].join(" ");
}

/** Hitung sudut jarum dari nilai arus */
export function needleAngleFromCurrent(current: number) {
  const pct = (current - MIN_CURRENT) / (MAX_CURRENT - MIN_CURRENT);
  return START_ANGLE + pct * ANGLE_RANGE;
}

/** Label tick 0..MAX_CURRENT (6 titik termasuk 0 & max) */
export function gaugeTickValues(count = 6) {
  return Array.from({ length: count }, (_, i) => Math.round((i * MAX_CURRENT) / (count - 1)));
}

/** Sudut untuk tick tertentu (0..MAX_CURRENT) */
export function angleForValue(v: number) {
  const pct = (v - MIN_CURRENT) / (MAX_CURRENT - MIN_CURRENT);
  return START_ANGLE + pct * ANGLE_RANGE;
}
