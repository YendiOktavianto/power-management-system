// page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Save, RefreshCw } from "lucide-react";
import type { LoPItem, WhyItem } from "./types";
import useEditCompany, { Notifier } from "./useEditCompany";

/* === Komponen yang dipindah === */
import useLocalToast from "@/components/common/hooks/useToastMessage";
import ToastInline from "@/components/common/ToastMessageInline";
import ListSimpleEditor from "./_components/ListSimpleEditor";
import Input from "./_components/Input";
import Textarea from "./_components/Textarea";
import UploadImage from "./_components/UploadImage";

import AppPageShell from "@/components/ui/AppPageShell";
import { INFO_CARD_BG } from "@/components/ui/theme";
import HeaderBar from "../_components/header/HeaderBar"
/* =============================== */

export default function AdminAboutEditor() {
  const router = useRouter();
  const toast = useLocalToast();

  // Adapter notifier untuk hook
  const notifier: Notifier = {
    info: toast.info,
    success: toast.success,
    error: toast.error,
  };

  const {
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
  } = useEditCompany(notifier);

  return (
    <AppPageShell>
      <HeaderBar
      title="Edit Company Page"
        saving={saving}
        onPreview={() => router.push("/about")}
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
                <UploadImage
                  label="Hero Background"
                  value={content.hero.heroImg}
                  onChange={(url) => setContent({ ...content, hero: { ...content.hero, heroImg: url } })}
                  notify={toast}
                />
              </div>
            )}

            {activeTab === "History" && (
              <div className="space-y-4">
                <Input
                  label="Section Title"
                  value={content.history.title}
                  onChange={(v) => setContent({ ...content, history: { ...content.history, title: v } })}
                />
                <Textarea
                  label="Body (support line breaks)"
                  rows={8}
                  value={content.history.body}
                  onChange={(v) => setContent({ ...content, history: { ...content.history, body: v } })}
                />
              </div>
            )}

            {activeTab === "Vision & Mission" && (
              <div className="space-y-8">
                <div className="rounded-xl border border-white/10 p-4">
                  <h4 className="text-sm font-medium text-[#7ec7ff] mb-3">Vision</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Vision Title"
                      value={content.vision.title}
                      onChange={(v) => setContent({ ...content, vision: { ...content.vision, title: v } })}
                    />
                    <Textarea
                      label="Vision Body"
                      value={content.vision.body}
                      onChange={(v) => setContent({ ...content, vision: { ...content.vision, body: v } })}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <h4 className="text-sm font-medium text-[#7ec7ff] mb-3">Mission</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Mission Title"
                      value={content.mission.title}
                      onChange={(v) => setContent({ ...content, mission: { ...content.mission, title: v } })}
                    />
                    <Textarea
                      label="Mission Body"
                      value={content.mission.body}
                      onChange={(v) => setContent({ ...content, mission: { ...content.mission, body: v } })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Why Us" && (
              <ListSimpleEditor<WhyItem>
                title="Why Choose Us"
                items={content.why}
                schema={[
                  { key: "title", label: "Title", type: "input" },
                  { key: "desc", label: "Description", type: "textarea" },
                ]}
                onAdd={() => {
                  setContent({ ...content, why: [...content.why, { title: "", desc: "" }] });
                }}
                onChange={(items) => setContent({ ...content, why: items })}
              />
            )}

            {activeTab === "Line of Products" && (
              <ListSimpleEditor<LoPItem>
                title="Line of Products & Services"
                items={content.lineOfProducts}
                schema={[
                  { key: "icon", label: "Icon (emoji / short)", type: "input" },
                  { key: "title", label: "Title", type: "input" },
                ]}
                onAdd={() => {
                  setContent({ ...content, lineOfProducts: [...content.lineOfProducts, { title: "", icon: "" }] });
                }}
                onChange={(items) => setContent({ ...content, lineOfProducts: items })}
              />
            )}
          </section>
        </div>

      <ToastInline toast={toast.toast} onClose={toast.close} />
    </AppPageShell>
  );
}
