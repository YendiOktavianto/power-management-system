import type { Content } from "./types";
import { FALLBACK } from "./constants";

/* ---------------- Utils: deep-merge & normalizer ---------------- */
export function merge<T>(base: T, patch: Partial<T>): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base)) return (patch as any) ?? base;
  if (typeof base === "object" && base !== null) {
    const out: any = { ...(base as any) };
    for (const k in base as any) {
      const pv = (patch as any)?.[k];
      out[k] = merge((base as any)[k], pv as any);
    }
    for (const k in (patch as any) || {}) {
      if (!(k in out)) out[k] = (patch as any)[k];
    }
    return out;
  }
  return (patch as any) ?? base;
}

export async function normalizeContent(res: Response): Promise<Content> {
  const raw = await res.json();
  const maybe = (raw as any)?.data ?? raw; // handle kasus { data: {...} }
  const obj = typeof maybe === "string" ? JSON.parse(maybe) : maybe;
  return merge(FALLBACK, obj || {});
}
