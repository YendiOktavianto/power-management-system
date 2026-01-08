"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppPageShell from "@/components/ui/AppPageShell";

import type {
  Feature,
  Step,
  Benefit,
  Comparison,
  Testimonial,
  ProductContent,
} from "./types";
import { DEFAULTS, TEMPLATE_PRODUCT, PRODUCT_KEY } from "./constants";
import {
  useLocalToast,
  getApiBase,
  joinUrl,
  deepMerge,
} from "./useProductEdit";

import ToastInline from "@/components/common/ToastMessageInline";
import Input from "./_components/Input";
import HeaderBar from "../_components/header/HeaderBar"
import Textarea from "./_components/Textarea";
import ListSimpleEditor from "./_components/ListSimpleEditor";
import ListWithImageEditor from "./_components/ListWithImageEditor";
import { INFO_CARD_BG} from "@/components/ui/theme";

/* ===================== END IMPORT ===================== */

/* ---------------- Component ---------------- */
export default function AdminProductEditor() {
  const router = useRouter();
  const toast = useLocalToast();

  const [content, setContent] = useState<ProductContent>(DEFAULTS);
  const [activeTab, setActiveTab] =
    useState<"Hero" | "Features" | "Steps" | "Benefits" | "Comparisons" | "Testimonials">("Hero");

  useEffect(() => {
    const base = "Admin • Product Editor";
    const suffix = activeTab ? ` – ${activeTab}` : "";
    if (typeof document !== "undefined") document.title = base + suffix;
  }, [activeTab]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load initial
  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const base = getApiBase();
        const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const raw = await res.json();
        const loaded: ProductContent = "data" in raw ? raw.data : raw;
        if (mounted) setContent(deepMerge(DEFAULTS, loaded));
        toast.info("Content loaded");
      } catch (e: any) {
        // kalau belum ada dokumen, pakai template
        setContent(TEMPLATE_PRODUCT);
        const msg = e?.message ?? "Unknown error";
        setError(`Load failed, using template: ${msg}`);
        toast.error("Failed to load content", msg);
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
      const base = getApiBase();
      const token = (typeof window !== "undefined" && localStorage.getItem("access_token")) || "";
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: content, updatedBy: "admin@powersys" }),
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
      toast.success("Changes are saved", "Product page updated");
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Save failed: ${msg}`);
      toast.error("Failed to save", msg);
    } finally {
      setSaving(false);
    }
  }

  async function resetFromServer() {
    setError("");
    try {
      const base = getApiBase();
      const url = joinUrl(base, `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const raw = await res.json();
      const loaded: ProductContent = "data" in raw ? raw.data : raw;
      setContent(deepMerge(DEFAULTS, loaded));
      toast.success("Content reset from server");
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(`Reload failed: ${msg}`);
      toast.error("Content reset failed", msg);
    }
  }

  function useTemplate() {
    setContent(JSON.parse(JSON.stringify(TEMPLATE_PRODUCT)));
    toast.info("The template is loaded", "Please adjust before saving");
  }

  useEffect(() => {
    const base = "Admin • Product Editor";
    const suffix = activeTab ? ` – ${activeTab}` : "";
    if (typeof document !== "undefined") document.title = base + suffix;
  }, [activeTab]);
  const tabs = useMemo(
    () =>
      ["Hero", "Features", "Steps", "Benefits", "Comparisons", "Testimonials"] as const,
    []
  );

  return (
    <AppPageShell>
      <HeaderBar
        title="Edit Product Page"
        saving={saving}
        onPreview={() => router.push("/discover")}
        onUseTemplate={useTemplate}
        onReset={resetFromServer}
        onSave={save}
      />       

        {/* Body */}
        <div
          className="
            mx-auto max-w-7xl 
            grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6
            flex-1 min-h-0 w-full
          "
        >
          {/* Tabs */}
          <aside 
            className="w-[200px] rounded-2xl p-3 md:sticky h-fit border border-white/10 backdrop-blur-md"
            style={{ background: INFO_CARD_BG }}
          >
            <ul className="space-y-1">
              {tabs.map((t) => (
                <li key={t}>
                  <button
                    onClick={() => setActiveTab(t)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                      activeTab === t
                        ? "bg-white/7"
                        : "hover:bg-white/5 text-white/90"
                    }`}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section
            className="
              rounded-2xl p-5
              min-w-0 min-h-0 h-full overflow-y-auto
              [scrollbar-gutter:stable] border border-white/10 backdrop-blur-md
            "
            style={{ background: INFO_CARD_BG }}
          >
            {activeTab === "Hero" && (
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={content.hero.title}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })}
                />
                <Textarea
                  label="Subtitle"
                  value={content.hero.subtitle}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, subtitle: v } })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Button Label"
                    value={content.hero.ctaLabel}
                    onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaLabel: v } })}
                  />
                </div>
              </div>
            )}

            {activeTab === "Features" && (
              <ListWithImageEditor<Feature>
                title="Features"
                items={content.features}
                schema={[
                  { key: "title", label: "Title", type: "input" },
                  { key: "desc", label: "Description", type: "textarea" },
                  { key: "img", label: "Image", type: "image" },
                ]}
                onAdd={() => {
                  setContent({ ...content, features: [...content.features, { title: "", desc: "", img: "" }] });
                  useLocalToast().info("Row added");
                }}
                onChange={(items) => setContent({ ...content, features: items })}
              />
            )}

            {activeTab === "Steps" && (
              <ListSimpleEditor<Step>
                title="Steps"
                items={content.steps}
                schema={[
                  { key: "title", label: "Title", type: "input" },
                  { key: "desc", label: "Description", type: "textarea" },
                ]}
                onAdd={() => {
                  setContent({ ...content, steps: [...content.steps, { title: "", desc: "" }] });
                  useLocalToast().info("Row added");
                }}
                onChange={(items) => setContent({ ...content, steps: items })}
              />
            )}

            {activeTab === "Benefits" && (
              <ListSimpleEditor<Benefit>
                title="Benefits"
                items={content.benefits}
                schema={[
                  { key: "title", label: "Title", type: "input" },
                  { key: "desc", label: "Description", type: "textarea" },
                ]}
                onAdd={() => {
                  setContent({ ...content, benefits: [...content.benefits, { title: "", desc: "" }] });
                  useLocalToast().info("Row added");
                }}
                onChange={(items) => setContent({ ...content, benefits: items })}
              />
            )}

            {activeTab === "Comparisons" && (
              <ListSimpleEditor<Comparison>
                title="Why Choose Us"
                items={content.comparisons}
                schema={[
                  { key: "title", label: "Title", type: "input" },
                  { key: "desc", label: "Description", type: "textarea" },
                ]}
                onAdd={() => {
                  setContent({ ...content, comparisons: [...content.comparisons, { title: "", desc: "" }] });
                  useLocalToast().info("Row added");
                }}
                onChange={(items) => setContent({ ...content, comparisons: items })}
              />
            )}

            {activeTab === "Testimonials" && (
              <ListWithImageEditor<Testimonial>
                title="Testimonials"
                items={content.testimonials}
                schema={[
                  { key: "name", label: "Name", type: "input" },
                  { key: "role", label: "Role", type: "input" },
                  { key: "feedback", label: "Feedback", type: "textarea" },
                  { key: "avatar", label: "Avatar", type: "image" },
                ]}
                onAdd={() => {
                  setContent({
                    ...content,
                    testimonials: [...content.testimonials, { name: "", role: "", feedback: "", avatar: "/profile.svg" }],
                  });
                  useLocalToast().info("Row added");
                }}
                onChange={(items) => setContent({ ...content, testimonials: items })}
              />
            )}
          </section>
        </div>
      <ToastInline toast={toast.toast} onClose={toast.close} />
    </AppPageShell>
  );
}
