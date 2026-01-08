import { DeviceRow, YesNo } from './types';
import { API_DEVICES, ADMIN_TOKEN_KEY } from './constants';

const isYesNo = (v: unknown): v is YesNo => v === 'YES' || v === 'NO';

export type CreateDevicePayload = {
  serial_number: string;
  username: string;
  address_name: string;
  detail_address_name?: string;
  lat: number;
  long: number;
  segment: string;
  wattage: string;
  phase?: string;
};

export type UpdateDevicePayload = {
  address_name: string;
  detail_address_name?: string;
  lat: number;
  long: number;
  segment: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code?: string, message?: string) {
    super(message ?? code ?? `HTTP_${status}`);
    this.status = status;
    this.code = code;
  }
}

const authHeaders = (): HeadersInit => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) ?? '' : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export async function fetchDevices(q?: string): Promise<DeviceRow[]> {
  const url = new URL(API_DEVICES);
  if (q && q.trim()) url.searchParams.set('q', q.trim());

  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include'
  });

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) return [];

  // sedikit guard biar tipe "YES"|"NO" tegas
  return json.map((x: any) => ({
    id: String(x.id ?? ''),
    serial_number: String(x.serial_number ?? ''),
    username: String(x.username ?? ''),
    wattage: String(x.wattage ?? ''),
    phase: String(x.phase ?? ''),
    address_name: x.address_name ?? null,
    detail_address_name: x.detail_address_name ?? null,
    long: typeof x.long === 'number' ? x.long : x.long == null ? null : Number(x.long),
    lat:  typeof x.lat  === 'number' ? x.lat  : x.lat  == null ? null : Number(x.lat),
    segment: x.segment ?? null,
    active: isYesNo(x.active) ? x.active : 'NO',
  })) as DeviceRow[];
}

export async function createDevice(payload: CreateDevicePayload): Promise<DeviceRow> {
  const res = await fetch(API_DEVICES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, json?.code ?? json?.error ?? json?.message, json?.message);
  }
  return json as DeviceRow;
}

export async function updateDevice(
  id: string | number,
  payload: UpdateDevicePayload
): Promise<DeviceRow> {
  const res = await fetch(`${API_DEVICES}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // lempar ApiError (class-mu sudah ada di file ini)
    throw new ApiError(res.status, (json as any)?.code, json);
  }
  return json as DeviceRow;
}

export async function deleteDevice(id: string | number): Promise<void> {
  const res = await fetch(`${API_DEVICES}/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    const txt = await res.text().catch(() => "");
    throw new ApiError(res.status, txt || "DELETE_FAILED");
  }
}
