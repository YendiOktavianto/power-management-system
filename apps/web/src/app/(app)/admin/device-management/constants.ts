const BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');
const PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX || '').replace(/^\/|\/$/g, '');
export const API_DEVICES = PREFIX ? `${BASE}/${PREFIX}/devices` : `${BASE}/devices`;
export const ADMIN_TOKEN_KEY = 'access_token_admin';

export const ADDRESS_NAME_MAX = 200;

export const WATTAGE_OPTIONS = [
  "1000 VA",
  "2000 VA",
  "4000 VA",
  "5000 VA",
  "7000 VA",
  "10000 VA",
  "15000 VA",
] as const;

export type WattageOpt = (typeof WATTAGE_OPTIONS)[number];

export const DEFAULT_LOCATION = {
  lat: -6.2,
  lng: 106.816666, 
};

export const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export const PREFILL_KEY = "prefillDeviceData";

export const getAuthHeaders = (): Record<string, string> => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(ADMIN_TOKEN_KEY) ?? ""
        : "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};
