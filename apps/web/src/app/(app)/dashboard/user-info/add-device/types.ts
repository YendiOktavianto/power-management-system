export type DataItem = {
  code: string;
  postal: number;
  province: string;
  city: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
};

export type Request = {
  id: number;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string;
  time: number; // epoch ms or s
};

export type Option = {
  label: string;
  value: string;
  lat?: number;
  lng?: number;
  postal?: number;
  code?: string;
};


export type ToastKind = "success" | "error" | "info" | "danger";
export type ToastPayload = { type: ToastKind; text: string; id: number };