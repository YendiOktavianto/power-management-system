// apps/web/src/app/lib/fetchWithAuth.ts

export type FetchWithAuthOptions = RequestInit & {
  autoRedirectOn401?: boolean; // kalau mau matikan redirect, bisa set false
};

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: FetchWithAuthOptions = {}
): Promise<Response | null> {
  const { autoRedirectOn401 = true, ...rest } = init;

  const res = await fetch(input, {
    ...rest,
    credentials: rest.credentials ?? "include", // default: kirim cookie
  });

  if (res.status === 401 && autoRedirectOn401) {
    if (typeof window !== "undefined") {
      const current = window.location.pathname + window.location.search;
      const next = encodeURIComponent(current || "/dashboard");
      console.warn("[fetchWithAuth] 401 – redirecting to /login");
      window.location.href = `/login?next=${next}`;
    }

    // ⬇️ caller harus cek: if (!res) return;
    return null;
  }

  return res;
}
