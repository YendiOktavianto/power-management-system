// app/(dashboard)/dashboard/power-monitoring/type.ts
export type Location = {
  id?: number;              // ← baru
  device_id: string;        // serial yang ditampilkan
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

// dipakai untuk map komponen section
export type SectionProps<T = Location> = { device?: T };
