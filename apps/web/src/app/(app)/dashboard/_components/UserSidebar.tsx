// app/dashboard/components/Sidebar.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";

import {
  SidebarContainer,
  SidebarLogo,
  MainMenu,
  CollapsibleSection,
  SubmenuList,
  LogoutLink,
  type MenuItem,
  type SubItem,
} from "./features/user-sidebar";

const LAST_POWER_KEY = "lastPowerSub";
const LAST_REPORT_KEY = "lastReportSub";
const slugify = (s: string) => s.toLowerCase().replace(/ /g, "-");
const unslug = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Sidebar({
  selectedPage,
  setLoading,
  setSelectedPage,
  setShowLogoutOverlay,
}: {
  selectedPage: string;
  setLoading: (v: boolean) => void;
  setSelectedPage: (v: string) => void;
  setShowLogoutOverlay: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const menus: readonly MenuItem[] = [
    { key: "Home",            label: "Home",            icon: "/home.svg",             activeIcon: "/home_active.svg",               path: "/dashboard/home" },
    { key: "Site Monitoring", label: "Site Monitoring", icon: "/site-monitoring.svg",  activeIcon: "/site_monitoring_active.svg",    path: "/dashboard" },
    { key: "User Info",       label: "User Info",       icon: "/user-info.svg",        activeIcon: "/profile_active.svg",            path: "/dashboard/user-info" },
    { key: "General Info",    label: "General Info",    icon: "/general-info.svg",     activeIcon: "/general_info_active.svg",       path: "/dashboard/general-info" },
  ] as const;

  const powerMenus = [
    "Voltage", "Current", "Frequency", "Power Factor", "Power", "Energy Usage",
  ] as const;

  const reportMenus: readonly SubItem[] = [
    { key: "Summary Report",      label: "Summary Report",      path: "/dashboard/report/summary-report" },
    { key: "Energy Usage Report", label: "Energy Usage Report", path: "/dashboard/report/energy-usage-report" },
  ] as const;

  const isOnPowerPage = pathname.startsWith("/dashboard/power-monitoring");

  useEffect(() => {
    if (powerMenus.includes(selectedPage as any)) setIsPowerOpen(true);
    if (selectedPage === "Summary Report" || selectedPage === "Energy Usage Report") setIsReportOpen(true);
  }, [selectedPage]);

  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/dashboard/report/")) {
      if (pathname.includes("summary-report")) setSelectedPage("Summary Report");
      else if (pathname.includes("energy-usage-report")) setSelectedPage("Energy Usage Report");
      setIsReportOpen(true);
      setIsPowerOpen(false);
      return;
    }

    if (pathname === "/dashboard/power-monitoring" && !window.location.hash) {
      setSelectedPage("Power Monitoring");
      setIsPowerOpen(true);
      setIsReportOpen(false);
      return;
    }

    const top = [
      { key: "Home", path: "/dashboard/home" },
      { key: "Site Monitoring", path: "/dashboard" },
      { key: "User Info", path: "/dashboard/user-info" },
      { key: "General Info", path: "/dashboard/general-info" },
    ].find((m) => m.path === pathname);

    if (top) {
      setSelectedPage(top.key);
      setIsPowerOpen(false);
      setIsReportOpen(false);
    }
  }, [pathname, setSelectedPage]);

  useEffect(() => {
    if (!isOnPowerPage) return;

    const applyHash = () => {
      const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
      if (h) {
        const name = unslug(h);
        if (powerMenus.includes(name as any)) {
          setSelectedPage(name);
          setIsPowerOpen(true);
          setIsReportOpen(false);
          try { localStorage.setItem(LAST_POWER_KEY, name); } catch {}
          return;
        }
      }
      setSelectedPage("Power Monitoring");
      setIsPowerOpen(true);
      setIsReportOpen(false);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [isOnPowerPage, setSelectedPage]);

  useEffect(() => {
    const onSection = (e: any) => {
      const key = e?.detail as string | undefined;
      if (!key) return;
      setSelectedPage(key);
      try { localStorage.setItem(LAST_POWER_KEY, key); } catch {}
      setIsPowerOpen(true);
      setIsReportOpen(false);
    };
    window.addEventListener("pm-section-change", onSection);
    return () => window.removeEventListener("pm-section-change", onSection);
  }, [setSelectedPage]);

  const handleClick = async (key: string, path?: string) => {
    setSelectedPage(key);

    if (powerMenus.includes(key as any)) {
      try { localStorage.setItem(LAST_POWER_KEY, key); } catch {}
    }
    if (key === "Summary Report" || key === "Energy Usage Report") {
      try { localStorage.setItem(LAST_REPORT_KEY, key); } catch {}
    }

    if (key === "Logout") {
      setShowLogoutOverlay(true);
      return;
    }

    if (powerMenus.includes(key as any)) {
      const hash = `#${slugify(key)}`;
      setIsPowerOpen(true);
      setIsReportOpen(false);

      if (isOnPowerPage) {
        const target = `/dashboard/power-monitoring${hash}`;
        if (pathname + (window.location.hash || "") !== target) {
          router.replace(target);
        }
        return;
      }
      router.push(`/dashboard/power-monitoring${hash}`);
      return;
    }

    if (path) {
      if (path === pathname) return;
      if (path.startsWith("/dashboard/report/")) {
        setIsReportOpen(true);
        setIsPowerOpen(false);
      } else if (path.startsWith("/dashboard/power-monitoring")) {
        setIsPowerOpen(true);
        setIsReportOpen(false);
      } else {
        setIsPowerOpen(false);
        setIsReportOpen(false);
      }
      flushSync(() => setLoading(true));
      router.push(path);
    }
  };

  return (
    <SidebarContainer>
      <SidebarLogo />

      <nav className="flex-1 overflow-hidden flex flex-col text-[11px] leading-tight">
        {/* MAIN MENU */}
        <MainMenu
          items={menus}
          selectedKey={selectedPage}
          onClick={(item) => handleClick(item.key, item.path)}
          afterClick={() => {
            setIsPowerOpen(false);
            setIsReportOpen(false);
          }}
        />

        {/* POWER MONITORING */}
        <CollapsibleSection
          label="Power Monitoring"
          active={
            isPowerOpen ||
            selectedPage === "Power Monitoring" ||
            powerMenus.includes(selectedPage as any)
          }
          open={isPowerOpen}
          activeIcon="/power_monitoring_active.svg"
          inactiveIcon="/power-monitoring.svg"
          onLabelClick={() => {
            if (isPowerOpen && (powerMenus.includes(selectedPage as any) || selectedPage === "Power Monitoring")) {
              setIsPowerOpen(false);
              return;
            }
            setIsReportOpen(false);
            setIsPowerOpen(true);
            setSelectedPage("Power Monitoring");

            const targetPath = "/dashboard/power-monitoring";
            if (isOnPowerPage) {
              try { history.replaceState(null, "", targetPath); } catch {}
              const root = document.getElementById("pm-scroll");
              if (root) root.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }
            flushSync(() => setLoading(true));
            router.push(targetPath);
          }}
          onToggle={() =>
            setIsPowerOpen((prev) => {
              const next = !prev;
              if (next) setIsReportOpen(false);
              return next;
            })
          }
          id="power-submenu"
        >
          <SubmenuList
            items={powerMenus.map((x) => ({ key: x, label: x }))}
            selectedKey={selectedPage}
            onSelect={(key) => handleClick(key)}
          />
        </CollapsibleSection>

        {/* REPORT */}
        <CollapsibleSection
          label="Report"
          active={
            selectedPage === "Report" ||
            selectedPage === "Summary Report" ||
            selectedPage === "Energy Usage Report" ||
            isReportOpen
          }
          open={isReportOpen}
          activeIcon="/report_active.svg"
          inactiveIcon="/report.svg"
          onLabelClick={() =>
            setIsReportOpen((prev) => {
              const next = !prev;
              if (next) {
                setIsPowerOpen(false);
                try {
                  const last = localStorage.getItem(LAST_REPORT_KEY);
                  const target =
                    last === "Energy Usage Report"
                      ? "/dashboard/report/energy-usage-report"
                      : "/dashboard/report/summary-report";
                  if (!pathname.startsWith("/dashboard/report/")) {
                    handleClick(last || "Summary Report", target);
                  }
                } catch {}
              }
              return next;
            })
          }
          onToggle={() =>
            setIsReportOpen((prev) => {
              const next = !prev;
              if (next) setIsPowerOpen(false);
              return next;
            })
          }
          id="report-submenu"
        >
          <SubmenuList
            items={reportMenus}
            selectedKey={selectedPage}
            onSelect={(key) => {
              const found = reportMenus.find((r) => r.key === key);
              handleClick(key, found?.path);
            }}
          />
        </CollapsibleSection>

        {/* LOGOUT */}
        <LogoutLink
          active={selectedPage === "Logout"}
          onClick={() => {
            handleClick("Logout");
            setIsPowerOpen(false);
            setIsReportOpen(false);
          }}
        />
      </nav>
    </SidebarContainer>
  );
}
