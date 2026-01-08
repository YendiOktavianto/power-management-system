// app/(dashboard)/dashboard/power-monitoring/validation.ts
import type { Location } from "./types";

export function safeLower(v?: string) {
  return (v ?? "").toLowerCase();
}

export function getLocationLabel(d?: Partial<Location>) {
  if (!d) return "-";
  const name = d.address_name ?? "";
  const detail = d.detail_location ?? "";
  const left = String(name).trim();
  const right = String(detail).trim();
  if (!left && !right) return "-";
  if (left && !right) return left;
  if (!left && right) return right;
  return `${left} | ${right}`;
}
