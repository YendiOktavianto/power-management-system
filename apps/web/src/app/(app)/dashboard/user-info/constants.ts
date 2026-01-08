const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  .replace(/\/+$/, '');

const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, '');

const BASE_WITH_PREFIX = PREFIX ? `${BASE}/${PREFIX}` : BASE;

export const API_USER_INFO = `${BASE_WITH_PREFIX}/user-info`;
export const API_USER_INFO_PROFILE = `${API_USER_INFO}/profile`;
export const API_USER_INFO_PASSWORD = `${API_USER_INFO}/password`;
export const API_USER_INFO_PHOTO = `${API_USER_INFO}/photo`;

export const subtitle = `Manage profiles, contacts, and security`;

