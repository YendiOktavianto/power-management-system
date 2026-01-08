"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Content } from "./types";
import useEditLanding from "./useEditLanding";

import AppPageShell from "@/components/ui/AppPageShell";
import HeaderBar from "../_components/header/HeaderBar";
import { INFO_CARD_BG } from "@/components/ui/theme";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastInline from "@/components/common/ToastMessageInline";

// tab components
import HeroTab from "./_tabs/HeroTab";
import AboutTab from "./_tabs/AboutTab";
import FeaturesTab from "./_tabs/FeaturesTab";
import ProductsTab from "./_tabs/ProductsTab";
import LeadershipTab from "./_tabs/LeadershipTab";
import ContactsTab from "./_tabs/ContactsTab";
import LocationTab from "./_tabs/LocationTab";

type TabKey =
  | "Hero"
  | "About"
  | "Features"
  | "Products"
  | "Leadership"
  | "Contacts"
  | "Location";

export default function AdminEditLandingPage() {
  const router = useRouter();
  const toastApi = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("Hero");

  const { content, setContent, saving, error, save, resetFromServer, useTemplate } =
    useEditLanding();

  // dynamic title
  useEffect(() => {
    const base = "Admin • Landing Editor";
    const suffix = activeTab ? ` – ${activeTab}` : "";
    if (typeof document !== "undefined") document.title = base + suffix;
  }, [activeTab]);

  const tabs = useMemo(
    () =>
      [
        "Hero",
        "About",
        "Features",
        "Products",
        "Leadership",
        "Contacts",
        "Location",
      ] as const,
    [],
  );

  // handler tombol utama
  async function handleSave() {
    const ok = await save();
    if (ok) {
      toastApi.success(
        "Changes are saved",
        "Landing page content has been successfully updated",
      );
    } else {
      toastApi.error("Failed to save", "Please check your connection or try again");
    }
  }

  async function handleReset() {
    const ok = await resetFromServer();
    if (ok) {
      toastApi.success("Content reset", "Landing content reloaded from server");
    } else {
      toastApi.error(
        "Content reset failed",
        "Could not reload content from server",
      );
    }
  }

  function handleUseTemplate() {
    useTemplate();
    toastApi.info("The template is loaded", "Please adjust before saving");
  }

  // mapping TabKey → component
  const renderTab = (key: TabKey) => {
    const commonProps = { content, setContent, toastApi } as {
      content: Content;
      setContent: (c: Content) => void;
      toastApi: ReturnType<typeof useToast>;
    };

    switch (key) {
      case "Hero":
        return <HeroTab {...commonProps} />;
      case "About":
        return <AboutTab {...commonProps} />;
      case "Features":
        return <FeaturesTab {...commonProps} />;
      case "Products":
        return <ProductsTab {...commonProps} />;
      case "Leadership":
        return <LeadershipTab {...commonProps} />;
      case "Contacts":
        return <ContactsTab {...commonProps} />;
      case "Location":
        return <LocationTab {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <AppPageShell>
      <HeaderBar
        title="Edit Landing Page"
        saving={saving}
        onPreview={() => router.push("/")}
        onUseTemplate={handleUseTemplate}
        onReset={handleReset}
        onSave={handleSave}
      />

      <div
        className="
          mx-auto max-w-7xl 
          grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6
          flex-1 min-h-0 w-full
        "
      >
        {/* Sidebar Tabs */}
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

        {/* Tab Content */}
        <section
          className="
            rounded-2xl p-5
            min-w-0 min-h-0 h-full overflow-y-auto
            [scrollbar-gutter:stable] border border-white/10 backdrop-blur-md
          "
          style={{ background: INFO_CARD_BG }}
        >
          {renderTab(activeTab)}

          {error && (
            <p className="mt-4 text-xs text-red-300 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
              {error}
            </p>
          )}
        </section>
      </div>

      <ToastInline toast={toastApi.toast} onClose={toastApi.close} />
    </AppPageShell>
  );
}
