export type Location = {
  id?: number;              
  device_id: string;       
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type SectionProps<T = Location> = { device?: T };

export type Loc = {
  device_id?: string;
  address_name?: string;
  detail_location?: string;
  watt_phase?: string;
  segment?: string;
};

export type Props = {
  activeLoc?: Loc;
  pickBtnRef?: React.MutableRefObject<HTMLButtonElement | null> | ((el: HTMLButtonElement | null) => void);
  pickerOpen: boolean;
  onOpen: () => void;
};

export type Props2 = {
  open: boolean;
  LOCS: Location[];
  selectedLocation: number;
  setSelectedLocation: (idx: number) => void;

  filtered: Location[];
  query: string;
  setQuery: (v: string) => void;

  hi: number;
  setHi: React.Dispatch<React.SetStateAction<number>>;

  closePicker: () => void;
  cardBg?: string; 
};

export type Props3 = {
  show: boolean;
  activeLoc?: Loc;
  onOpenPicker: () => void;
  cardBg: string;
};