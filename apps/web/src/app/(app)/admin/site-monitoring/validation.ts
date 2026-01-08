import type { Location } from "./types";

export function validateLocations(data: unknown): data is Location[] {
  if (!Array.isArray(data)) return false;

  return data.every((loc) => {
    if (typeof loc !== "object" || loc === null) return false;
    const x = loc as Record<string, unknown>;
    return (
      typeof x.id === "string" &&
      typeof x.lat === "number" &&
      typeof x.lng === "number" &&
      typeof x.address_name === "string" &&
      typeof x.isActive === "boolean"
    );
  });
}

export function getStr(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

export function getNum(o: Record<string, unknown>, key: string): number | undefined {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function getBool(o: Record<string, unknown>, key: string): boolean | undefined {
  const v = o[key];
  return typeof v === "boolean" ? v : undefined;
}

