export class LocationMarkerDto {
  deviceId!: string;
  segment!: string | null;
  status!: 'Active' | 'Inactive';
  addressName!: string | null;
  detailAddressName!: string | null;
  latitude!: number | null;
  longitude!: number | null;
  username?: string | null;
  serialNumber?: string | null;
}
