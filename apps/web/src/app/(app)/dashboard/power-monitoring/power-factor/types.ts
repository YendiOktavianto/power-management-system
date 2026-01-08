// app/(dashboard)/dashboard/power-monitoring/power-factor/type.ts

export type Location = {
  device_id: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type PFPoint = { time: string; powerFactor: number };
