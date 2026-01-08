export const BASE_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export const API_REPORT_SUMMARY = `${BASE_API}/reports/summary`;
export const API_REPORT_ENERGY = `${BASE_API}/reports/energy`;
export const API_MY_DEVICES = `${BASE_API}/monitoring-info/mine`;

export const USER_TOKEN_KEY = "access_token_user";
