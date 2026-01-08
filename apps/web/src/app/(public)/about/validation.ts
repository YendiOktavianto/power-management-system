// validation.ts
import { Content, LoPItem, WhyItem } from "./types";

export function isWhyArray(v: unknown): v is WhyItem[] {
  return Array.isArray(v) && v.every((x) => x && typeof x.title === "string" && typeof x.desc === "string");
}

export function isLoPArray(v: unknown): v is LoPItem[] {
  return Array.isArray(v) && v.every((x) => x && typeof x.title === "string" && typeof x.icon === "string");
}

// helper kecil untuk aman ambil nested field string
export function strOr(def: string, v: unknown): string {
  return typeof v === "string" && v.length >= 0 ? v : def;
}

// tipe Partial<Content> biar nyaman saat merge
export type PartialContent = Partial<Content> & {
  hero?: Partial<Content["hero"]>;
  history?: Partial<Content["history"]>;
  vision?: Partial<Content["vision"]>;
  mission?: Partial<Content["mission"]>;
};
