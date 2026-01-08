export type Location = {
  id: string;
  lat: number;
  lng: number;
  address_name: string;
  detail_address?: string;
  device_id?: string;
  segment?: string;
  isActive: boolean;
};

export type Center = { lat: number; lng: number };

export type BackendLocationDto = {
  deviceId: string;
  segment: string | null;
  status: "Active" | "Inactive";
  addressName: string | null;
  detailAddressName: string | null;
  latitude: number | null;
  longitude: number | null;
  username: string | null;
  serialNumber: string | null;
};

export type SiteLocationMarker = {
  id: string;
  lat: number;
  lng: number;
  addressName: string;
  detailAddressName: string;
  segment: string;
  isActive: boolean;
  username: string | null;
  serialNumber: string | null;
};

export type MarkerItem = {
  id: string;
  lat: number;
  lng: number;
  addressName: string;
  detailAddressName: string;
  segment: string;
  isActive: boolean;
};

