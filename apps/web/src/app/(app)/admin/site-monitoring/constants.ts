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
