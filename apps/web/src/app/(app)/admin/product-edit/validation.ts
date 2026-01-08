// validation.ts

// deepMerge persis dengan versi di file asli
export function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (Array.isArray(base)) return ((patch as any) ?? (base as any)) as T;
  if (typeof base === "object" && base) {
    const out: any = Array.isArray(base) ? [] : { ...base };
    for (const k in base as any) {
      const bv = (base as any)[k];
      const pv = (patch as any)?.[k];
      out[k] =
        typeof bv === "object" && bv && !Array.isArray(bv)
          ? deepMerge(bv, (pv as any) ?? {})
          : (pv ?? bv);
    }
    for (const k in patch as any) if (!(k in out)) out[k] = (patch as any)[k];
    return out;
  }
  return (patch as T) ?? base;
}
