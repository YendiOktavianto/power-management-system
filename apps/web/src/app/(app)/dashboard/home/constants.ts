export const BASE_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:4000"
).replace(/\/+$/, "");

// ⬇ untuk list semua lokasi / device admin
export const API_MY_DEVICES = `${BASE_API}/home/locations`;

// ⬇ untuk snapshot dashboard admin
export const API_HOME = `${BASE_API}/home`;

export const USER_TOKEN_KEY = "access_token_user";
