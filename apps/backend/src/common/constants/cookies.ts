// apps/backend/src/common/constants/cookies.ts
import type { CookieOptions } from 'express';

export const AT_COOKIE_USER = 'accessToken_user';
export const RT_COOKIE_USER = 'refreshToken_user';
export const AT_COOKIE_ADMIN = 'accessToken_admin';
export const RT_COOKIE_ADMIN = 'refreshToken_admin';

const cookieDomain = process.env.COOKIE_DOMAIN;
const isProd = process.env.NODE_ENV === 'production';

// Base opsi cookie; domain hanya dipakai jika diset lewat env.
const baseCookieOpt: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
  path: '/',
};

export const cookieOptUser: CookieOptions = { ...baseCookieOpt };
export const cookieOptAdmin: CookieOptions = { ...baseCookieOpt };
