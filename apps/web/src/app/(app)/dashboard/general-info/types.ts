import type { ReactNode } from "react";

export type DeviceGeneralInfo = {
  // id numerik dari general_info.device_id
  numericId?: number;

  device_id: string;
  serial_number: string;

  location?: string;
  address_name?: string;
  detail_location?: string;

  wattage?: string;
  watt_phase?: string;

  segment?: string;

  // nanti bisa diisi dari detail/power monitoring
  active?: boolean;

  powerState?: "Active" | "Inactive" | null;
  lastUpdate?: string | null;
  unlocked?: boolean;
};

export type Device = DeviceGeneralInfo;

export type Props = {
  icon?: React.ReactNode;
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export type RowProps = Props;
