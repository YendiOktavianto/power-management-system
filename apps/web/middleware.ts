// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_TOKEN_USER = "accessToken_user";   // cookie dari BE
const ACCESS_TOKEN_ADMIN = "accessToken_admin"; // cookie dari BE
const ROLE_COOKIE = "role";                     // cookie role (opsional)

// route yang BOLEH diakses tanpa login
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

// prefix route yang WAJIB login
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/report",
  "/site-monitoring",
  "/general-info",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function needsAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Skip file statis & asset
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon") ||
    /\.[\w]+$/.test(pathname) // /logo.png, /font.woff2, dll
  ) {
    return NextResponse.next();
  }

  const adminToken = req.cookies.get(ACCESS_TOKEN_ADMIN)?.value ?? null;
  const userToken = req.cookies.get(ACCESS_TOKEN_USER)?.value ?? null;
  const token = adminToken ?? userToken;
  const role = req.cookies.get(ROLE_COOKIE)?.value ?? null;

  // 2) Sudah login tapi buka halaman publik -> redirect ke dashboard/admin
  if (token && isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = adminToken || role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3) Route butuh auth tapi belum ada token -> redirect ke login
  if (!token && needsAuth(pathname)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // jangan menumpuk ?next= berulang-ulang
    if (!loginUrl.searchParams.has("next")) {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4) Proteksi /admin: jika tidak punya token admin dan role bukan ADMIN, lempar ke dashboard
  if (pathname.startsWith("/admin")) {
    if (!adminToken && role && role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 5) Lanjutkan request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/auth/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/report/:path*",
    "/site-monitoring/:path*",
    "/general-info/:path*",
  ],
};
