// app/(app)/admin/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./_components/AdminSidebar";
import Header from "./_components/Header";
import { usePathname, useRouter } from "next/navigation";
import Logout from "./logout/page";
import LoadingOverlay from "../../../components/common/LoadingOverlay";

// 🔹 SESUAIKAN ke endpoint cek user-mu (sama seperti layout user)
const AUTH_CHECK_URL =
  `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/auth/me`;

// 🔐 Hook guard auth: cek /auth/me, kalau 401 → tendang ke /login
function useAuthGuard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch(AUTH_CHECK_URL, {
          method: "GET",
          credentials: "include", // kirim cookie HttpOnly
        });

        // kalau token invalid / expired → backend balas 401
        if (res.status === 401) {
          if (typeof window !== "undefined") {
            const current = window.location.pathname + window.location.search;
            const next = encodeURIComponent(current || "/admin/dashboard");
            router.replace(`/login?next=${next}`);
          }
          return;
        }

        // kalau mau, bisa parse data user di sini:
        // const me = await res.json();
      } catch (err) {
        console.error("[AdminDashboardLayout] auth check gagal:", err);
        // optional: kalau cek gagal, tetap tendang ke login
        if (typeof window !== "undefined") {
          const current = window.location.pathname + window.location.search;
          const next = encodeURIComponent(current || "/admin/dashboard");
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [time, setTime] = useState("");
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // ⬇️ panggil guard di sini, TETAP di bagian atas (masih sebelum return)
  const authChecked = useAuthGuard();

  // ⬇️ EFFECT 1: update selectedPage berdasarkan pathname
  useEffect(() => {
    const currentPath = pathname ?? "";
    if (currentPath.includes("site-monitoring")) {
      setSelectedPage("Site Monitoring");
    } else if (currentPath.includes("user-management")) {
      setSelectedPage("User Management");
    } else if (currentPath.includes("device-management")) {
      setSelectedPage("Device Management");
    } else if (currentPath.includes("device-request")) {
      setSelectedPage("Device Request");
    } else if (currentPath.includes("summary-report")) {
      setSelectedPage("Summary Report");
    } else if (currentPath.includes("energy-usage-report")) {
      setSelectedPage("Energy Usage Report");
    } else if (currentPath.includes("list-cost-energy")) {
      setSelectedPage("List Cost Energy");
    } else if (currentPath.includes("edit-landing")) {
      setSelectedPage("Edit Landing Page");
    } else if (currentPath.includes("edit-company")) {
      setSelectedPage("Edit Company");
    } else if (currentPath.includes("product-edit")) {
      setSelectedPage("Edit Product");
    } else if (currentPath.includes("logout")) {
      setSelectedPage("Logout");
    } else {
      setSelectedPage("Dashboard");
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  // ⬇️ EFFECT 2: update jam
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      const date = now.toLocaleDateString("en-GB", options).replace(/ /g, " ");
      const clock = now.toLocaleTimeString("en-GB", { hour12: false });
      setTime(`${date} | ${clock}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ⬇️ BARU di sini kita boleh return kondisi
  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg2.png')" }}
      >
        <LoadingOverlay show />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg2.png')" }}
    >
      <LoadingOverlay show={loading} />

      <Sidebar
        selectedPage={selectedPage}
        setLoading={setLoading}
        setSelectedPage={setSelectedPage}
        setShowLogoutOverlay={setShowLogoutOverlay}
      />

      <div className="flex-1 pl-[310px] pt-6 flex flex-col h-screen min-h-0">
        <div className="sticky top-0 z-10">
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
        <Logout
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
