// apps/web/src/app/(app)/admin/device-requests/validation.ts
import type { Request } from "./types";

/** Parse aman dari respons teks ke array Request (fallback ke [] bila kosong/invalid) */
export function safeParseRequests(text: string | null | undefined): Request[] {
  if (!text) return [];
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? (data as Request[]) : [];
  } catch {
    return [];
  }
}

/** Filter sederhana sesuai logic aslinya (gabung semua kolom lalu includes) */
export function filterRequests(data: Request[], q: string): Request[] {
  const lower = (q || "").toLowerCase();
  return data.filter((d) =>
    [
      d.id,
      d.username,
      d.address,
      d.segmen,
      d.detail_address,
      d.lat,
      d.lng,
      d.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(lower)
  );
}
