// apps/web/src/app/(reports)/api.ts

import { ADMIN_TOKEN_KEY, USER_TOKEN_KEY } from "./constants";

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // admin harus selalu diprioritaskan
  const admin = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (admin) return admin;

  const user = window.localStorage.getItem(USER_TOKEN_KEY);
  if (user) return user;

  return null;
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken();
  console.log("[authHeaders] token:", token);

  const base: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    base.Authorization = `Bearer ${token}`;
  }

  return { ...base, ...(extra as any) };
}
