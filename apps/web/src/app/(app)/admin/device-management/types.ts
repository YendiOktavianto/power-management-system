export type YesNo = 'YES' | 'NO';

export interface DeviceRow {
  id: string;
  serial_number: string;
  username: string;
  wattage: string;
  phase: string;
  address_name?: string | null;
  detail_address_name?: string | null;
  long?: number | null;
  lat?: number | null;
  segment?: string | null;
  active: YesNo;
}

export type DataRow = {
  id: string;
  serial_number: string;
  username: string;
  wattage: string;
  phase: string;
  address_name: string;
  detail_address_name: string;
  long: number;
  lat: number;
  segment: string;
  active: YesNo;
};

export type AddMode = "approve" | "create";

export type ErrorMap = Partial<Record<keyof DataRow, string>>;


export type ToastKind = "success" | "error" | "info" | "danger";
export type ToastPayload = { type: ToastKind; text: string; id: number };