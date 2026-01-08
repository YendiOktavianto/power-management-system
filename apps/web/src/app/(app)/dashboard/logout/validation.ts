import type { LogoutScope } from "./types";

export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");
  return base.replace(/\/+$/, "");
}

export function deriveScopeFromPath(pathname: string | null): Exclude<LogoutScope, "all"> {
  const p = pathname ?? "";
  return p.startsWith("/admin") ? "admin" : "user";
}
