// src/app/(app)/dashboard/report/api.ts
import { USER_TOKEN_KEY } from "./summary-report/constants";

export const authHeaders = (): HeadersInit => {
  try {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem(USER_TOKEN_KEY) ?? ""
        : "";

    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
};
