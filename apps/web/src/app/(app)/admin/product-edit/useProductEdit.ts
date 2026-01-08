"use client";

import { useState } from "react";
import type { ToastData, ToastKind } from "./types";
import { UPLOAD_PATH } from "./constants";

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
/* ---------------- Utils ---------------- */
export function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  return base.replace(/\/+$/, "");
}
export function joinUrl(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
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

/* ---------------- LOCAL TOAST (hook, no JSX here) ---------------- */
export function useLocalToast() {
  const [toast, setToast] = useState<ToastData>({
    open: false,
    kind: "info",
    title: "",
    desc: "",
  });

  function show(kind: ToastKind, title: string, desc?: string) {
    setToast({ open: true, kind, title, desc });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4200);
  }
  return {
    toast,
    show,
    success: (t: string, d?: string) => show("success", t, d),
    error: (t: string, d?: string) => show("error", t, d),
    info: (t: string, d?: string) => show("info", t, d),
    close: () => setToast((t) => ({ ...t, open: false })),
  };
}

/* ---------------- Upload helper (fallback 404) ---------------- */
export async function uploadImageToServer(file: File, fieldName = "file"): Promise<string> {
  const base = getApiBase();
  const token = (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
  const form = new FormData();
  form.append(fieldName, file);

  const primaryPath = UPLOAD_PATH || "/api/v1/upload";
  const candidates = [primaryPath, "/upload"];

  let lastErr: any = null;

  for (const path of candidates) {
    const url = joinUrl(base, path);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });

      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail =
            typeof j?.message === "string"
              ? j.message
              : Array.isArray(j?.message)
              ? j.message.join(", ")
              : JSON.stringify(j);
        } catch {
          detail = await res.text().catch(() => "");
        }
        if (res.status === 404) {
          console.warn(
            "[fetchMyDevices] not ok:",
            res.status,
            res.statusText
          );
        }
        throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
      }

      const json = await res.json();
      let out = json?.url ?? json?.path ?? json?.location ?? json?.secure_url ?? "";
      if (!out) throw new Error("Upload response missing url|path|location");
      if (!/^https?:\/\//i.test(out)) out = joinUrl(base, String(out));
      return out;
    } catch (e) {
      lastErr = e;
      if (!(e instanceof Error && String(e.message).includes("404"))) break;
    }
  }

  throw lastErr ?? new Error("Upload failed for all candidate paths");
}
