import type { ReactNode } from "react";

export function safe<T>(v: T | null | undefined, fallback = "-"): T | string {
  return v === null || v === undefined || (v as any) === "" ? fallback : v;
}

export function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// masih dipakai oleh Row / Overview
export function maskIfLocked(unlocked: boolean, value: ReactNode): ReactNode {
  return unlocked ? value : "—";
}
