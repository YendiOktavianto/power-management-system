import type { DeviceGeneralInfo } from "./types";

export const USER_TOKEN_KEY = "access_token_user";

export const BASE_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export const API_GENERAL_INFO_DEVICES = `${BASE_API}/general-info/devices`;
export const API_GENERAL_INFO_QR = `${BASE_API}/general-info/qr`;
export const API_GENERAL_INFO_VERIFY = `${BASE_API}/general-info/verify`;
export const API_GENERAL_INFO_DETAIL = `${BASE_API}/general-info/detail`;
export const API_GENERAL_INFO_UNLOCK_STATUS = `${BASE_API}/general-info/unlock-status`;

export const API_ENDPOINT = API_GENERAL_INFO_DEVICES;

export const idOf = (d?: DeviceGeneralInfo) =>
  d?.serial_number ?? d?.device_id ?? "";

// 🔹 BARIS ATAS overlay → detail dulu (lantai/ruang), baru fallback alamat
export const nameOf = (d?: DeviceGeneralInfo) =>
  d?.detail_location ??
  d?.address_name ??
  d?.location ??
  "-";

// 🔹 BARIS BAWAH overlay → alamat utama
export const detailOf = (d?: DeviceGeneralInfo) =>
  d?.address_name ??
  d?.location ??
  "-";

export const numericIdOf = (d?: DeviceGeneralInfo) =>
  typeof d?.numericId === "number"
    ? d.numericId
    : d?.device_id && !Number.isNaN(Number(d.device_id))
    ? Number(d.device_id)
    : undefined;

export function authHeaders(extra?: HeadersInit): HeadersInit {
  if (typeof window === "undefined") return extra ?? {};
  const token = window.localStorage.getItem(USER_TOKEN_KEY) ?? "";

  const base: Record<string, string> = { Accept: "application/json" };

  if (extra instanceof Headers) {
    extra.forEach((v, k) => {
      base[k] = v;
    });
  } else if (Array.isArray(extra)) {
    extra.forEach(([k, v]) => {
      base[k] = v;
    });
  } else if (extra) {
    Object.assign(base, extra);
  }

  if (token) {
    base.Authorization = `Bearer ${token}`;
  }

  return base;
}
