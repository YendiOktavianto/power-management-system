"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTE_LOADING_DELAY_MS } from "./constants";
import { resolveSelectedPage, formatNow } from "./validation";
import {  BG_URL } from "@/components/ui/theme";

export default function useDashboardLayout() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [selectedPage, setSelectedPage] = useState("Site Monitoring");
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedPage(resolveSelectedPage(pathname));
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), ROUTE_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const tick = () => setTime(formatNow());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    time,
    selectedPage, setSelectedPage,
    showLogoutOverlay, setShowLogoutOverlay,
    loading, setLoading,
    BG_URL,
  };
}
