import type { DataRow } from "./types";

/* ---------- Constants & helpers (tidak mengubah perilaku) ---------- */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

export const ADMIN_API_BASE = `${API_BASE}/admin`;

export const getAuthHeaders = (): Record<string, string> => {
  try {
    const token =
      (typeof window !== "undefined" && localStorage.getItem("access_token_admin")) ||
      "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

/* Seed data sama seperti komponen awal */
export const initialTableData: DataRow[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone_number: `08${String(i).padStart(9, "0")}`,
  password: "",
  confirmPassword: "",
  role: `user`,
  total_device: Math.floor(Math.random() * 10),
  created_at: `2025-08-20 10:${String(i % 60).padStart(2, "0")}:00`,
}));
