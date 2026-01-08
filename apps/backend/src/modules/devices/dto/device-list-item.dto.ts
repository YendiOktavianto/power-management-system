export type YesNo = 'YES' | 'NO';
export class DeviceListItemDto {
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

  constructor(partial?: Partial<DeviceListItemDto>) {
    Object.assign(this, partial);
  }
}
