// validation.ts

export function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

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

/** whitelist hanya Google Maps embed */
export function allowlistedEmbed(src: string): string {
  try {
    const u = new URL(src);
    const hostOk = /(^|\.)google\.(com|[a-z.]*co\.\w+)$/i.test(u.hostname);
    const isEmbedPath = u.pathname.startsWith("/maps/embed");
    const isMapsOutputEmbed = u.pathname.startsWith("/maps") && u.searchParams.get("output") === "embed";
    return hostOk && (isEmbedPath || isMapsOutputEmbed) ? src : "";
  } catch {
    return "";
  }
}

/** Convert Google Maps URL (bukan short maps.app.goo.gl) → embed src */
export function toMapsEmbedFromUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    if (/maps\.app\.goo\.gl$/i.test(u.hostname)) return "";

    if (/(^|\.)google\.(com|co\.\w+)$/i.test(u.hostname) && u.pathname.startsWith("/maps")) {
      if (u.pathname.startsWith("/maps/embed")) return url;

      const qParam = u.searchParams.get("q");
      const placeMatch = u.pathname.match(/\/maps\/place\/([^/@]+)/i);
      const coordMatch = u.pathname.match(/\/maps\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/i);

      let q = qParam || (placeMatch ? decodeURIComponent(placeMatch[1]) : "");
      if (!q && coordMatch) q = `${coordMatch[1]},${coordMatch[2]}`;

      if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  } catch {}
  return "";
}
