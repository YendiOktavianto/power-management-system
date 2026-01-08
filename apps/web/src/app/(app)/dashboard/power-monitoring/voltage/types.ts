// app/(dashboard)/dashboard/power-monitoring/voltage/type.ts

export type Location = {
  device_id: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type VoltagePoint = { time: string; voltage: number };

export type SegmentedVoltagePoint = {
  time: string;
  voltage: number | null;
  red: number | null;
  yellow: number | null;
  lime: number | null;
};