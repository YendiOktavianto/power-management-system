// type.ts
export type DataRow = {
  id: string;
  date: string;
  time: string;
  voltage: number;
  current: number;
  frequency: number;
  cos: number;
  power: number;
  phase: string;
  cost: number;
  validFrom: string;
  validUntil: string;
};

export type ToastKind = "success" | "error" | "info" | "danger";
export type ToastPayload = { type: ToastKind; text: string; id: number };
