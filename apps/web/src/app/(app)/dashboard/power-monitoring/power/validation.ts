// app/(dashboard)/dashboard/power-monitoring/power/validation.ts
import { ANGLE_RANGE, MAX_VAL, MIN_VAL, START_ANGLE } from "./constants";

/** Polar → Cartesian untuk SVG */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG Arc path dari sudut start→end */
export function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArc, 0, endPt.x, endPt.y].join(" ");
}

/** Sudut jarum dari nilai daya */
export function needleAngleFromValue(val: number) {
  const pct = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}

/** Sudut untuk nilai tertentu pada gauge */
export function angleForValue(v: number) {
  const pct = (v - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return START_ANGLE + pct * ANGLE_RANGE;
}
