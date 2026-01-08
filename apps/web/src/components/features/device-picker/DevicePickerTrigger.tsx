"use client";

import React from "react";

export type DeviceGetters<T> = {
  getId?: (d: T) => string;
  getAddressName?: (d: T) => string;
  getDetailLocation?: (d: T) => string;
  getSegment?: (d: T) => string;
  getWattPhase?: (d: T) => string;
};

type Props<T> = DeviceGetters<T> & {
  devicesView: T[];
  selectedId?: string;
  setSelected: (id: string) => void;
  current?: T | Partial<T>;
  onOpen: () => void;
  pickBtnRef?:
    | React.MutableRefObject<HTMLButtonElement | null>
    | ((el: HTMLButtonElement | null) => void);
  forceOverlay?: boolean;
};

const DEFAULT_KEYS = {
  id: "device_id",
  address: "address_name",
  location: "detail_location",
  segment: "segment",
  watt: "watt_phase",
} as const;

function pickField<T>(d: T | Partial<T> | undefined, key: string): string {
  if (!d) return "-";
  const rec = d as unknown as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : String(v ?? "-");
}

function toRefCallback(
  ref?:
    | React.MutableRefObject<HTMLButtonElement | null>
    | ((el: HTMLButtonElement | null) => void)
): (el: HTMLButtonElement | null) => void {
  return (el) => {
    if (!ref) return;
    if (typeof ref === "function") ref(el);
    else ref.current = el;
  };
}

export default function DevicePickerTrigger<T>({
  devicesView,
  selectedId,
  setSelected,
  current,
  onOpen,
  pickBtnRef,
  getId,
  getAddressName,
  getDetailLocation,
  forceOverlay,
}: Props<T>) {
  const idOf = (d: T) => getId?.(d) ?? pickField(d, DEFAULT_KEYS.id);
  const addrOf = (d?: T | Partial<T>) =>
    d && getAddressName ? getAddressName(d as T) : pickField(d, DEFAULT_KEYS.address);
  const locOf = (d?: T | Partial<T>) =>
    d && getDetailLocation ? getDetailLocation(d as T) : pickField(d, DEFAULT_KEYS.location);

  const shouldUseSelect = !forceOverlay && devicesView.length <= 3;

  if (shouldUseSelect) {
    return (
      <select
        className="bg-[#0C1F3C]/80 border border-white/15 text-white/90
                   text-[12px] rounded w-full sm:w-auto backdrop-blur
                   focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition"
        value={selectedId ?? ""}
        onChange={(e) => setSelected(e.target.value)}
      >
        {devicesView.map((device, i) => (
          <option key={idOf(device) || i} value={idOf(device)}>
            {addrOf(device)} • {locOf(device)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      ref={toRefCallback(pickBtnRef)}
      type="button"
      onClick={onOpen}
      className="bg-[#0C1F3C]/80 border border-white/15 text-left
                 px-1.5 py-0.5 rounded w-full sm:w-full backdrop-blur
                 focus:outline-none focus:ring-2 focus:ring-sky-400/50
                 text-white/90 text-[10px] transition max-w-[225px] truncate"
      aria-haspopup="dialog"
      aria-expanded={false}
    >
      <span>{`${addrOf(current)} | ${locOf(current)}`}</span>
    </button>
  );
}
