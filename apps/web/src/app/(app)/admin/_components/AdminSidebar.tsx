// app/admin/components/AdminSidebar.tsx
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
} from "./features/admin-sidebar"

const LAST_REPORT_KEY = "lastReportSub";
const LAST_EDIT_KEY = "lastEditSub";

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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleClick = (key: string, path?: string) => {
    setSelectedPage(key);
    if (key === "Logout") {
      setShowLogoutOverlay(true);
      return;
    }
    if (path) {
      flushSync(() => setLoading(true));
      router.push(path);
    }
  };

  /* ================= Menus ================= */
  const menus: readonly MenuItem[] = [
    { key: "Dashboard",        label: "Dashboard",        icon: "/dashboard.svg",      activeIcon: "/dashboard_active.svg",      path: "/admin" },
    { key: "Site Monitoring",  label: "Site Monitoring",  icon: "/site-monitoring.svg",activeIcon: "/site_monitoring_active.svg", path: "/admin/site-monitoring" },
    { key: "User Management",  label: "User Management",  icon: "/user-info.svg",      activeIcon: "/profile_active.svg",        path: "/admin/user-management" },
    { key: "Device Management",label: "Device Management",icon: "/general-info.svg",   activeIcon: "/general_info_active.svg",   path: "/admin/device-management" },
    { key: "Device Request",   label: "Device Request",   icon: "/request.svg",        activeIcon: "/request_active.svg",        path: "/admin/device-request" },
    { key: "List Cost Energy", label: "List Cost Energy", icon: "/cost.svg",           activeIcon: "/cost_active.svg",           path: "/admin/list-cost-energy" },
  ] as const;

  const reportMenus: readonly SubItem[] = [
    { key: "Summary Report",      label: "Summary Report",      path: "/admin/report/summary-report" },
    { key: "Energy Usage Report", label: "Energy Usage Report", path: "/admin/report/energy-usage-report" },
  ] as const;

  const editMenus: readonly SubItem[] = [
    { key: "Edit Landing Page", label: "Edit Landing Page", path: "/admin/edit-landing" },
    { key: "Edit Company",      label: "Edit Company",      path: "/admin/edit-company" },
    { key: "Edit Product",      label: "Edit Product",      path: "/admin/product-edit" },
  ] as const;

  const isReportActive =
    selectedPage === "Report" ||
    selectedPage === "Summary Report" ||
    selectedPage === "Energy Usage Report";

  const isEditActive =
    selectedPage === "Edit" ||
    selectedPage === "Edit Landing Page" ||
    selectedPage === "Edit Company" ||
    selectedPage === "Edit Product";

  useEffect(() => {
    if (selectedPage === "Summary Report" || selectedPage === "Energy Usage Report") {
      setIsReportOpen(true);
    }
    if (
      selectedPage === "Edit Landing Page" ||
      selectedPage === "Edit Company" ||
      selectedPage === "Edit Product"
    ) {
      setIsEditOpen(true);
    }
  }, [selectedPage]);

  // ======= Helpers tetap sama (localStorage, push, dsb.) =======
  const goToReport = (key?: "Summary Report" | "Energy Usage Report") => {
    let last: string | null = null;
    try { last = localStorage.getItem(LAST_REPORT_KEY); } catch {}

    const chosen = (key || (last as any) || "Summary Report") as
      | "Summary Report"
      | "Energy Usage Report";

    const target =
      chosen === "Summary Report"
        ? "/admin/report/summary-report"
        : "/admin/report/energy-usage-report";

    if (pathname !== target || selectedPage !== chosen) {
      flushSync(() => setLoading(true));
      setSelectedPage(chosen);
      try { localStorage.setItem(LAST_REPORT_KEY, chosen); } catch {}
      router.push(target);
    } else {
      setSelectedPage(chosen);
    }

    setIsReportOpen(true);
    setIsEditOpen(false);
  };

  type EditKey = "Edit Landing Page" | "Edit Company" | "Edit Product";
  const goToEdit = (key?: EditKey) => {
    let last: string | null = null;
    try { last = localStorage.getItem(LAST_EDIT_KEY); } catch {}

    const chosen = (key || (last as any) || "Edit Landing Page") as EditKey;

    const mapPath: Record<EditKey, string> = {
      "Edit Landing Page": "/admin/edit-landing",
      "Edit Company": "/admin/edit-company",
      "Edit Product": "/admin/product-edit",
    };

    const target = mapPath[chosen];

    if (pathname !== target || selectedPage !== chosen) {
      flushSync(() => setLoading(true));
      setSelectedPage(chosen);
      try { localStorage.setItem(LAST_EDIT_KEY, chosen); } catch {}
      router.push(target);
    } else {
      setSelectedPage(chosen);
    }

    setIsEditOpen(true);
    setIsReportOpen(false);
  };

  // ======= Render =======
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
            setIsReportOpen(false);
            setIsEditOpen(false);
          }}
        />

        {/* REPORT */}
        <CollapsibleSection
          label="Report"
          active={isReportActive}
          open={isReportOpen}
          activeIcon="/report_active.svg"
          inactiveIcon="/report.svg"
          onLabelClick={() => goToReport()}
          onToggle={() =>
            setIsReportOpen((prev) => {
              const next = !prev;
              if (next) setIsEditOpen(false);
              return next;
            })
          }
          id="report-submenu"
        >
          <SubmenuList
            items={reportMenus}
            selectedKey={selectedPage}
            onSelect={(key) => {
              try { localStorage.setItem(LAST_REPORT_KEY, key); } catch {}
              goToReport(key as "Summary Report" | "Energy Usage Report");
            }}
          />
        </CollapsibleSection>

        {/* EDIT */}
        <CollapsibleSection
          label="Edit"
          active={isEditActive}
          open={isEditOpen}
          activeIcon="/cost_active.svg"
          inactiveIcon="/cost.svg"
          onLabelClick={() => goToEdit()}
          onToggle={() =>
            setIsEditOpen((prev) => {
              const next = !prev;
              if (next) setIsReportOpen(false);
              return next;
            })
          }
          id="edit-submenu"
        >
          <SubmenuList
            items={editMenus}
            selectedKey={selectedPage}
            onSelect={(key) => {
              try { localStorage.setItem(LAST_EDIT_KEY, key); } catch {}
              goToEdit(key as EditKey);
            }}
          />
        </CollapsibleSection>

        {/* LOGOUT */}
        <LogoutLink
          active={selectedPage === "Logout"}
          onClick={() => {
            handleClick("Logout");
            setIsReportOpen(false);
            setIsEditOpen(false);
          }}
        />
      </nav>
    </SidebarContainer>
  );
}
