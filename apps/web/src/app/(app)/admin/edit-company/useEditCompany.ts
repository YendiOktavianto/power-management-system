// useEditCompany.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AboutContent } from "./types";
import { ABOUT_KEY, DEFAULTS, TEMPLATE_ABOUT, UPLOAD_PATH } from "./constants";
import { deepMerge, getApiBase, joinUrl } from "./validation";

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
/** Minimal notifier contract so hook tidak bergantung ke implementasi toast */
export type Notifier = {
  info: (title: string, desc?: string) => void;
  success: (title: string, desc?: string) => void;
  error: (title: string, desc?: string) => void;
};

/** Upload helper (fallback 404 aware) — diekspor agar bisa dipakai komponen UploadImage */
export async function uploadImageToServer(
  file: File,
  fieldName = "file"
): Promise<string> {
  const base = getApiBase();
  const token =
    (typeof window !== "undefined" && localStorage.getItem("access_token")) ||
    "";
  const form = new FormData();
  form.append(fieldName, file);

  const candidates = [UPLOAD_PATH || "/api/v1/upload", "/upload"];
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
          lastErr = new Error(
            `404 Not Found on ${url}${detail ? ` – ${detail}` : ""}`
          );
          continue;
        }
        console.warn(
            "[fetchMyDevices] not ok:",
            res.status,
            res.statusText
          );
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

export type Tabs =
  | "Hero"
  | "History"
  | "Vision & Mission"
  | "Why Us"
  | "Line of Products";

/** Hook inti untuk load/save/reset konten Company */
export default function useEditCompany(notify?: Notifier) {
  const [content, setContent] = useState<AboutContent>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<Tabs>("Hero");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tabs = useMemo(
    () => ["Hero", "History", "Vision & Mission", "Why Us", "Line of Products"] as const,
    []
  );

  // Title dinamis mengikuti tab
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `Admin • Company Editor – ${activeTab}`;
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const base = getApiBase();
        const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(ABOUT_KEY)}`);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const raw = await res.json();
        const loaded: AboutContent = "data" in raw ? raw.data : raw;
        if (mounted) setContent(deepMerge(DEFAULTS, loaded));
        notify?.info?.("Content loaded");
      } catch (e: any) {
        if (mounted) setContent(TEMPLATE_ABOUT);
        const msg = e?.message ?? "Unknown error";
        setError(`Load failed, using template: ${msg}`);
        notify?.error?.("Failed to load content", msg);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const hero = {
        ...content.hero,
        title: content.hero.title?.trim() || TEMPLATE_ABOUT.hero.title,
        subtitle: content.hero.subtitle?.trim() || TEMPLATE_ABOUT.hero.subtitle,
      };

      const base = getApiBase();
      const token =
        (typeof window !== "undefined" && localStorage.getItem("access_token")) ||
        "";
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(ABOUT_KEY)}`);
      const body = { data: { ...content, hero }, updatedBy: "admin@powersys" };

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
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
        throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
      }
      notify?.success?.("Changes are saved", "Company page updated");
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Save failed: ${msg}`);
      notify?.error?.("Failed to save", msg);
    } finally {
      setSaving(false);
    }
  }

  async function resetFromServer() {
    setError("");
    try {
      const base = getApiBase();
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(ABOUT_KEY)}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const raw = await res.json();
      const loaded: AboutContent = "data" in raw ? raw.data : raw;
      setContent(deepMerge(DEFAULTS, loaded));
      notify?.success?.("Content reset from server");
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Reload failed: ${msg}`);
      notify?.error?.("Content reset failed", msg);
    }
  }

  function useTemplate() {
    setContent(JSON.parse(JSON.stringify(TEMPLATE_ABOUT)));
    notify?.info?.("The template is loaded", "Please adjust before saving");
  }

  return {
    content,
    setContent,
    activeTab,
    setActiveTab,
    saving,
    error,
    tabs,
    save,
    resetFromServer,
    useTemplate,
  };
}

export { getApiBase, joinUrl }; // re-export biar bisa dipakai komponen UploadImage
