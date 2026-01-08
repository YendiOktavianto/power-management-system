//============= page.tsx ================
export type Location = {
  id: string;
  lat: number;
  lng: number;
  address_name: string;
  detail_address?: string;
  device_id?: string;
  segment?: string;
  isActive: boolean;
  serialNumber?: string;
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
  serialNumber?: string | number;
};

export type SiteLocationMarker = {
  id: string;
  lat: number;
  lng: number;
  addressName: string;
  detailAddressName: string;
  segment: string;
  isActive: boolean;
  serialNumber?: string;
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

//============= layout.tsx ================
export type DashboardLayoutProps = {
  children: React.ReactNode;
};

export type OverlayControls = {
  setSelectedPage: (v: string) => void;
  setShowLogoutOverlay: (v: boolean) => void;
};

