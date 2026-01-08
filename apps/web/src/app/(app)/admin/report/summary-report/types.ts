export type Location = { id: string; name: string };

export type PQRow = {
  id: string;
  location_id: string;
  date: string;
  time: string;
  voltage: number;
  current: number;
  frequency: number;
  cos: number;
  power: number;
};

export type Row = {
  id: string | number;
  date: string;
  time: string;
  voltage: number | string;
  current: number | string;
  frequency: number | string;
  cos: number | string;
  power: number | string;
};

export type LocationOpt = { id: string; name: string };

export type Props = {
  show: number;
  setShow: (n: number) => void;
  selectedLocation: string;
  setSelectedLocation: (v: string) => void;
  filterDate: string;
  setFilterDate: (v: string) => void;
  timeFrom: string;
  setTimeFrom: (v: string) => void;
  timeTo: string;
  setTimeTo: (v: string) => void;
  locations: LocationOpt[];
  openPicker: (el: HTMLInputElement | null) => void;
};

export interface SummaryReportParams {
  deviceId: number;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

export interface SummaryRow {
  id: number;
  dataId: number;
  date: string;
  time: string;
  voltage: number;
  current: number;
  frequency: number;
  cos: number;
  power: number;
  address_name?: string;
  detail_address_name?: string;
}

export interface SummaryReportResponse {
  total: number;
  rows: SummaryRow[];
}
