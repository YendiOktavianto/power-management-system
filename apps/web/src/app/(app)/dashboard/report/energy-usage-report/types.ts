// apps/web/src/app/(reports)/energy-usage/types.ts

export type Location = {
  id: string;
  name: string;
};

export type RowData = {
  id: string;
  data_id: string | number;
  date: string; // YYYY-MM-DD
  start_kwh: number | string;
  end_kwh: number | string;
  usage_kwh: number | string;
  usage_cost_kwh: number | string;
  usage_cost_per_day: number | string;
};

export type Row = {
  id: string | number;
  data_id: string | number;
  date: string; // "YYYY-MM-DD"
  start_kwh: number;
  end_kwh: number; 
  usage_kwh: number;
  usage_cost_kwh: number;
  usage_cost_per_day: number;
};

export type LocationOpt = { id: string; name: string };

export type Props = {
  show: number;
  setShow: (n: number) => void;

  selectedLocation: string;
  setSelectedLocation: (v: string) => void;

  dateFrom: string;
  setDateFrom: (v: string) => void;

  dateTo: string;
  setDateTo: (v: string) => void;

  locations: LocationOpt[];
  openPicker: (el: HTMLInputElement | null) => void;
};
