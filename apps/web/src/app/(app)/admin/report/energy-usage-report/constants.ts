// apps/web/src/app/(reports)/energy-usage/constants.ts

export const BASE_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:4000"
).replace(/\/+$/, "");

// endpoint admin
export const API_ADMIN_REPORT_SUMMARY = `${BASE_API}/admin/reports/summary`;
export const API_ADMIN_REPORT_ENERGY  = `${BASE_API}/admin/reports/energy`;

// endpoint user (bukan admin)
export const API_MY_DEVICES = `${BASE_API}/monitoring-info/mine`;

// token key di localStorage
export const ADMIN_TOKEN_KEY = "access_token_admin";
export const USER_TOKEN_KEY  = "access_token_user";

// lokasi untuk admin (list semua device)
export const API_ADMIN_LOCATIONS = `${BASE_API}/locations/listAll`;
