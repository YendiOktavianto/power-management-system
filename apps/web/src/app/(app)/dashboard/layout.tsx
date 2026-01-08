// app/(app)/dashboard/layout.tsx
"use client";

import React from "react";   
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./_components/UserSidebar";
import Header from "./_components/Header"; 
import LogoutOverlay from "./logout/page";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import useDashboardLayout from "./useDashboardLayout"; 
import type { DashboardLayoutProps } from "./types"; 

// Endpoint cek sesi
const AUTH_CHECK_URL =
  `${process.env.NEXT_PUBLIC_API_BASE ?? ""}/auth/me`;  

function useAuthGuard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch(AUTH_CHECK_URL, {
          method: "GET",
          credentials: "include", // kirim cookie HttpOnly
        });

        // kalau token invalid / expired → backend balas 401/403/404
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          if (typeof window !== "undefined") {
            try {
              // bersihkan role non-HttpOnly kalau ada
              const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
              const domainPart = domain ? ` Domain=${domain};` : "";
              const sameSitePart = domain ? " SameSite=None;" : " SameSite=Lax;";
              const securePart = domain ? " Secure;" : "";
              document.cookie = `role=; Path=/; Max-Age=0;${domainPart}${sameSitePart}${securePart}`;
            } catch {}
            const current =
              window.location.pathname + window.location.search;
            const next = encodeURIComponent(current || "/dashboard");
            router.replace(`/login?next=${next}`);
          }
          return;
        }

        // kalau mau, bisa parse data user di sini:
        // const me = await res.json();
      } catch (err) {
        console.error("[DashboardLayout] auth check gagal:", err);
        // optional: kalau cek gagal, tetap tendang ke login
        if (typeof window !== "undefined") {
          const current =
            window.location.pathname + window.location.search;
          const next = encodeURIComponent(current || "/dashboard");
          router.replace(`/login?next=${next}`);
        }
        return;
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    };

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return authChecked;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    time,
    selectedPage, setSelectedPage,
    showLogoutOverlay, setShowLogoutOverlay,
    loading, setLoading,
    BG_URL,
  } = useDashboardLayout();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // panggil guard
  const authChecked = useAuthGuard();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, selectedPage]);

  // selama cek auth, tampilkan full-screen loading
  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${BG_URL}')` }}
      >
        <LoadingOverlay show />
      </div>
    );
  }

  return ( 
    <div
      className="min-h-screen flex bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${BG_URL}')` }}
    >
      <LoadingOverlay show={loading} />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toggle sidebar (mobile) */}
      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-30 rounded-lg bg-[#0f2a4d]/80 px-3 py-2 text-white shadow-lg border border-white/10"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar: slide di mobile, static di desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-[270px] transition-transform duration-300 md:static md:w-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          selectedPage={selectedPage}
          setLoading={setLoading}
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      </div>

      <div className="flex-1 pt-6 flex flex-col h-screen min-h-0 md:pl-[310px]">
        <div className="sticky top-0 z-10 pl-12 pr-4 md:pl-0 md:pr-0">
          <Header time={time} selectedPage={selectedPage} />
        </div>
        <div
          id="pm-scroll"
          className="flex-1 min-h-0 overflow-y-auto shadow-lg custom-scroll scroll-smooth"
        >
          {children}
        </div>
      </div>

      {showLogoutOverlay && (
        <LogoutOverlay
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
