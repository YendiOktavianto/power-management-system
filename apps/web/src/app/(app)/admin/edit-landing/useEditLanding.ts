"use client";

import { useEffect, useState } from "react";
import type { Content } from "./types";
import {
  API_BASE,
  CONTENT_KEY,
  DEFAULTS,
  TEMPLATE_LANDING,
  UPLOAD_PATH,
} from "./constants";
import { allowlistedEmbed, deepMerge, joinUrl } from "./validation";

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export async function uploadImageToServer(
  file: File,
  fieldName = "file",
): Promise<string> {
  const form = new FormData();
  form.append(fieldName, file);

  const candidates = [UPLOAD_PATH, "/upload"];
  let lastErr: any = null;

  for (const path of candidates) {
    const url = joinUrl(API_BASE, path);
    try {
      const res = await fetch(url, { method: "POST", body: form });
      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        if (res.status === 404) {
          lastErr = new Error(`404 on ${url} ${txt}`);
          continue;
        }
        console.warn(
            "[fetchMyDevices] not ok:",
            res.status,
            res.statusText
          );
      }
      const json = await res.json();
      const out =
        json?.url ?? json?.path ?? json?.location ?? json?.secure_url ?? "";
      if (!out) throw new Error("Upload response missing url|path|location");
      return out;
    } catch (e) {
      lastErr = e;
      if (!(e instanceof Error && String(e.message).includes("404"))) break;
    }
  }
  throw lastErr ?? new Error("Upload failed");
}

/** Hook inti: load, save, reset, useTemplate (tanpa toast) */
export default function useEditLanding() {
  const [content, setContent] = useState<Content>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const url = joinUrl(
          API_BASE,
          `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`,
        );
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(
            `${res.status} ${res.statusText}${txt ? ` – ${txt}` : ""}`,
          );
        }
        const raw = await res.json();
        const loaded = "data" in raw ? raw.data : raw;
        if (mounted) setContent(deepMerge(DEFAULTS, loaded));
      } catch (e: any) {
        setError(`Load failed: ${e?.message ?? "Unknown error"}`);
        setContent(DEFAULTS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function save(): Promise<boolean> {
    setSaving(true);
    setError("");
    try {
      const intro = {
        eyebrow:
          content.featuresIntro.eyebrow?.trim() ||
          TEMPLATE_LANDING.featuresIntro.eyebrow,
        headline:
          content.featuresIntro.headline?.trim() ||
          TEMPLATE_LANDING.featuresIntro.headline,
        body:
          content.featuresIntro.body?.trim() ||
          TEMPLATE_LANDING.featuresIntro.body,
      };
      const productsTitle =
        content.products.title?.trim() || TEMPLATE_LANDING.products.title;

      const url = joinUrl(
        API_BASE,
        `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`,
      );
      const sanitized: Content = {
        ...content,
        featuresIntro: intro,
        products: { ...content.products, title: productsTitle },
        contacts: (content.contacts || []).map((c) => ({
          img: "/profile.svg",
          ...c,
        })),
        location: {
          ...content.location,
          iframeSrc: allowlistedEmbed(content.location.iframeSrc),
        },
      };

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: sanitized,
          updatedBy: "admin@powersys",
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
      }
      return true;
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Save failed: ${msg}`);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function resetFromServer(): Promise<boolean> {
    setError("");
    try {
      const url = joinUrl(
        API_BASE,
        `/api/v1/content/${encodeURIComponent(CONTENT_KEY)}`,
      );
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const raw = await res.json();
      const loaded = "data" in raw ? raw.data : raw;
      setContent(deepMerge(DEFAULTS, loaded));
      return true;
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Reload failed: ${msg}`);
      return false;
    }
  }

  function useTemplate() {
    setContent(JSON.parse(JSON.stringify(TEMPLATE_LANDING)));
  }

  return { content, setContent, saving, error, save, resetFromServer, useTemplate };
}
