//============= page.tsx ================
import {Center} from "./types";

export const containerStyle = { width: "100%", height: "516px" };

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ??
   process.env.NEXT_PUBLIC_API_BASE ??
   "http://localhost:4000").replace(/\/$/, "");

export const LOCATIONS_API = `${API_BASE}/locations`;
export const DEFAULT_CENTER: Center = { lat: -6.21462, lng: 106.84513 };
export const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") ?? undefined : undefined;
export const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") ?? undefined : undefined;

//layout.tsx
// app/(dashboard)/dashboard/layout/constants.ts
export const BG_URL = "/bg2.png";

if (typeof window !== "undefined") {
  console.debug("[CFG] LOCATIONS_API =", LOCATIONS_API);
}

export const PAGE_MAP = [
  { match: "home",                          label: "Home" },
  { match: "power-monitoring/voltage",      label: "Voltage" },
  { match: "power-monitozring/current",      label: "Current" },
  { match: "power-monitoring/frequency",    label: "Frequency" },
  { match: "power-monitoring/power-factor", label: "Power Factor" },
  { match: "power-monitoring/power",        label: "Power" },
  { match: "power-monitoring/energy-usage", label: "Energy Usage" },
  { match: "power-monitoring",              label: "Power Monitoring" },
  { match: "user-info",                     label: "User Info" },
  { match: "general-info",                  label: "General Info" },
  { match: "summary-report",                label: "Summary Report" },
  { match: "energy-usage-report",           label: "Energy Usage Report" },
  { match: "logout",                        label: "Logout" },
] as const;

export const DEFAULT_PAGE_LABEL = "Site Monitoring";
export const ROUTE_LOADING_DELAY_MS = 800;
