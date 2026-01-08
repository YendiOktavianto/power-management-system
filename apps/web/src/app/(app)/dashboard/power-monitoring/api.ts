import { API_MON, API_MY_DEVICES, USER_TOKEN_KEY } from "./constants";

const authHeaders = (): HeadersInit => {
  try {
    const t = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) ?? '' : '';
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch { return {}; }
};

export type DeviceOption = {
  device_id?: string;
  serial_number?: string;    
  address_name?: string;
  detail_location?: string;
  segment?: string;
  wattage?: string | number;
  phase?: string | number;
  general_info?: { wattage?: string | number; phase?: string | number };
  location?: { address_name?: string; detail_address_name?: string; segment?: string };
};

export async function fetchMyDevices(): Promise<DeviceOption[]> {
  const res = await fetch(API_MY_DEVICES, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) return [];
  return (await res.json()) as DeviceOption[];
}

export type LatestRow = {
  date: string; time: string;
  voltage?: number;
  current?: number;
  frequency?: number;
  power?: number;
  power_factor?: number;
  total_energy_usage?: number;
  total_energy_usage_today?: number;
  total_energy_usage_mtd?: number;
};

export async function fetchLatest(deviceId: number): Promise<LatestRow | null> {
  const res = await fetch(`${API_MON}/latest/${deviceId}`, {
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 204 || res.status === 404) return null;

  if (!res.ok) {
  console.warn(
    "[fetchMyDevices] not ok:",
    res.status,
    res.statusText
    );
  }

  const text = await res.text().catch(() => "");
  if (!text || !text.trim()) return null;
  
  try {
    return JSON.parse(text) as LatestRow;
  } catch {
    return null;
  }
}

// contoh series harian (untuk chart garis)
export async function fetchSeriesToday(deviceId: number, isoDate: string) {
  const url = new URL(`${API_MON}/series/day`);
  url.searchParams.set('deviceId', String(deviceId));
  url.searchParams.set('date', isoDate); // "YYYY-MM-DD"
  const res = await fetch(url.toString(), { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) return [];
  return await res.json();
}
