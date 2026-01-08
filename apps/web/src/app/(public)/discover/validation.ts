// apps/web/src/app/(products)/discover/validation.ts

/** Base URL API (tanpa trailing slash) */
export function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  return base.replace(/\/+$/, "");
}

/** Join base + path */
export function joinUrl(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
}
