// app/(dashboard)/dashboard/power-monitoring/frequency/type.ts

export type Location = {
  device_id: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type FrequencyPoint = { time: string; frequency: number };
