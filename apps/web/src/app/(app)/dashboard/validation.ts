//============= page.tsx ================
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

//============= layout.tsx ================
import { DEFAULT_PAGE_LABEL, PAGE_MAP } from "./constants";

export function resolveSelectedPage(pathname?: string): string {
  const currentPath = (pathname ?? "").toLowerCase();
  for (const rule of PAGE_MAP) {
    if (currentPath.includes(rule.match)) return rule.label;
  }
  return DEFAULT_PAGE_LABEL;
}

export function formatNow(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  const date = now.toLocaleDateString("en-GB", options).replace(/ /g, " ");
  const clock = now.toLocaleTimeString("en-GB", { hour12: false });
  return `${date} | ${clock}`;
}
