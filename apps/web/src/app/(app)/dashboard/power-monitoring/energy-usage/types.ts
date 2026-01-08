export type Location = {
  device_id: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type EnergyPoint = { time: string; EnergyUsage: number };
