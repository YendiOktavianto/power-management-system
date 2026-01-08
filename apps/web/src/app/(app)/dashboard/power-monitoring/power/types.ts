// app/(dashboard)/dashboard/power-monitoring/power/type.ts

export type Location = {
  device_id: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type PowerPoint = { time: string; power: number };
