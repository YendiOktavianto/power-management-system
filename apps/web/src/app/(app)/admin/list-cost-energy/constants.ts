// constants.ts
import type { DataRow } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

export const TABLE_HEADERS: string[] = [
  "Wattage/Phase",
  "Cost (Rupiah)",
  "valid from",
  "valid until",
];

export const INITIAL_SHOW = 10 as const;

export const initialData: DataRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `0000${(i % 10) + 1}`,
  date: "2025-08-20",
  time: `10:19:${String(i % 10).padStart(2, "0")}`,
  voltage: 220,
  current: 4.5,
  frequency: 50,
  cos: 1,
  power: 900 + (i % 5) * 100,
  cost: 1200 + i * 10,
  validFrom: "2025-08-20 10:00:00",
  validUntil: "2025-08-20 18:00:00",
  phase: i % 2 === 0 ? "1 Phase" : "3 Phase",
}));
