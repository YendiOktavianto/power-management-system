const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');
const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, '');
const BASE_WITH_PREFIX = PREFIX ? `${BASE}/${PREFIX}` : BASE;
export const API_REQ = `${BASE_WITH_PREFIX}/device-request`;
