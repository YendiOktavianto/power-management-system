export interface Device {
  deviceId?: string;
  id?: number;

  device_id: string;
  serial_number?: string | number;

  address_name: string;
  detail_location: string;

  watt_phase?: string | null;
  wattagePhase?: string | null;

  segment?: string;

  voltage?: number;
  current?: number;
  frequency?: number;
  power?: number;
  power_Factor?: number;
  total_energy_usage_today?: number;
  total_energy_usage_Mtd?: number;
  total_energy_cost_today?: number;
  total_energy_cost_mtd?: number;
}
