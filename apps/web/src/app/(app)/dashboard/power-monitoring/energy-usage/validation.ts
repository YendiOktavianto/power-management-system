// app/(dashboard)/dashboard/power-monitoring/energy-usage/validation.ts
import { ANGLE_RANGE, END_ANGLE, MAX_VAL, MIN_VAL, START_ANGLE } from "./constants";

/** Konversi polar → kartesian untuk SVG */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path arc (sudut start→end derajat) */
export function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArc, 0, endPt.x, endPt.y].join(" ");
}

/** Sudut jarum dari nilai EnergyUsage */
export function needleAngleFromValue(val: number) {
  const pct = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}

/** Nilai label tick 0..MAX_VAL (6 titik) */
export function gaugeTickValues(count = 6) {
  return Array.from({ length: count }, (_, i) => Math.round((i * MAX_VAL) / (count - 1)));
}

/** Sudut untuk nilai tertentu pada gauge */
export function angleForValue(v: number) {
  const pct = (v - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}
