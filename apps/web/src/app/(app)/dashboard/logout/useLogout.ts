// apps/web/src/app/(auth)/logout-overlay/useLogout.ts
"use client";

import { usePathname, useRouter } from "next/navigation";
import { getApiBase, deriveScopeFromPath } from "./validation";
import type { LogoutScope } from "./types";

async function requestLogout(scope: LogoutScope = "all"): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/auth/logout?scope=${scope}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "");
    throw new Error(`Logout failed: ${res.status} ${text}`);
  }
}

export default function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  async function doLogout(
    opts: {
      setShowLogoutOverlay: (b: boolean) => void;
      setSelectedPage: (s: string) => void;
    }
  ) {
    const scope: Exclude<LogoutScope, "all"> = deriveScopeFromPath(pathname);
    try {
      await requestLogout(scope);
    } catch {
    } finally {
      try {
        localStorage.removeItem("access_token_user");
        localStorage.removeItem("access_token_admin");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userId");
      } catch {}
      opts.setShowLogoutOverlay(false);
      opts.setSelectedPage("Logout");
      router.replace("/login");
    }
  }
  return { doLogout };
}
