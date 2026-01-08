"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { DeviceGetters } from "./DevicePickerTrigger";

export type LegacyItem = { d: any; idx: number };

type LegacyProps = {
  mode: "legacy";
  open: boolean;
  query: string;
  setQuery: (v: string) => void;
  filtered: LegacyItem[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  onPick: (idx: number) => void;
  onClose: () => void;
  totalCount: number;
};

// 🔹 prioritas SERIAL NUMBER dulu, baru device_id
const LEGACY_ID = (d: any) => d?.serial_number ?? d?.device_id ?? "";
const LEGACY_NAME = (d: any) => d?.address_name ?? d?.location ?? "-";
const LEGACY_DETAIL = (d: any) => d?.detail_location ?? "-";

function LegacyPanel({
  query,
  setQuery,
  filtered,
  activeIdx,
  setActiveIdx,
  onPick,
  onClose,
  totalCount,
}: LegacyProps) {
  return (
    <div
      className="bg-[#032d7a] relative w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 sm:py-5 border-white/10 backdrop-blur-sm flex items-center gap-2">
        <input
          autoFocus
          placeholder="Search device / location…"
          className="w-full bg-white/[0.06] border border-white/15 text-white px-3 py-2 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-[12px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-white/10 text-[12px]"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      </div>

      <p className="text-xs text-white/70 mb-3">
        Result: <span className="text-white">{filtered.length}</span> / {totalCount} device
      </p>

      <ul className="max-h-[50vh] overflow-auto divide-y divide-white/10 overlay-scroll">
        {filtered.map(({ d, idx }, i) => {
          const isActive = i === activeIdx;
          return (
            <li key={LEGACY_ID(d) || idx}>
              <button
                className={`w-full text-left px-4 sm:px-5 py-3 transition ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => onPick(idx)}
                aria-selected={isActive}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="min-w-0">
                    <p className="font-medium truncate text-[11px] text-white">
                      {LEGACY_NAME(d)}
                    </p>
                    <p className="text-white/70 text-[11px] truncate">
                      {LEGACY_DETAIL(d)}
                    </p>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 sm:pl-4">
                    {/* 🔹 di sini sekarang tampil serial_number (fallback device_id) */}
                    <span className="text-white/70 text-[11px] truncate">
                      {LEGACY_ID(d)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="p-3 opacity-70">No results.</li>}
      </ul>
    </div>
  );
}

const DEFAULT_KEYS = {
  id: "device_id",
  address: "address_name",
  location: "detail_location",
  segment: "segment",
  watt: "watt_phase",
} as const;

function pick<T>(d: T, key: string) {
  const rec = d as unknown as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : String(v ?? "-");
}

type GenericProps<T> = DeviceGetters<T> & {
  mode?: "generic";
  open: boolean;
  filtered: T[];
  selectedId?: string;
  setSelected: (id: string) => void;
  query: string;
  setQuery: (v: string) => void;
  hi: number;
  setHi: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  cardBg?: string;
};

function GenericPanel<T>({
  filtered,
  selectedId,
  setSelected,
  query,
  setQuery,
  hi,
  setHi,
  onClose,
  cardBg,
  getId,
  getAddressName,
  getDetailLocation,
  getSegment,
  getWattPhase,
}: GenericProps<T>) {
  const idOf = (d: T) => getId?.(d) ?? pick(d, DEFAULT_KEYS.id);
  const addrOf = (d: T) => getAddressName?.(d) ?? pick(d, DEFAULT_KEYS.address);
  const locOf = (d: T) => getDetailLocation?.(d) ?? pick(d, DEFAULT_KEYS.location);
  const segOf = (d: T) => getSegment?.(d) ?? pick(d, DEFAULT_KEYS.segment);
  const wattOf = (d: T) => getWattPhase?.(d) ?? pick(d, DEFAULT_KEYS.watt);

  const handleSelect = (id: string) => {
    setSelected(id);
    onClose();
    setQuery("");
  };

  return (
    <div
      id="device-picker"
      className="relative w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 overflow-hidden"
      style={{ background: cardBg }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 sm:py-5 border-b border-white/10 backdrop-blur-sm flex items-center gap-2">
        <h2 id="device-picker-title" className="sr-only">
          Pilih Device
        </h2>
        <input
          autoFocus
          placeholder="Search device / location…"
          className="w-full bg-white/[0.06] border border-white/15 text-white px-3 py-2 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-[12px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!filtered.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((v) => Math.min(v + 1, filtered.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((v) => Math.max(v - 1, 0));
            }
            if (e.key === "Enter") {
              const d = filtered[hi];
              if (d) handleSelect(idOf(d));
            }
          }}
        />
        <button
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-white/10 text-[12px]"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      </div>

      <ul
        role="listbox"
        className="max-h-[50vh] overflow-auto divide-y divide-white/10 overlay-scroll"
      >
        {filtered.map((d, idx) => {
          const id = idOf(d);
          const isActive = selectedId === id;
          const isHi = filtered[hi] ? idOf(filtered[hi]) === id : false;

          return (
            <li key={id || idx}>
              <button
                role="option"
                aria-selected={isActive}
                className={`w-full text-left px-4 sm:px-5 py-3 transition ${
                  isHi ? "bg-white/15" : isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onMouseEnter={() => setHi(idx)}
                onClick={() => handleSelect(id)}
              >
                <div
                  className="
                    flex flex-col gap-1
                    sm:grid sm:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] sm:gap-2 sm:items-start
                  "
                >
                  {/* KIRI: lokasi + alamat */}
                  <div className="min-w-0">
                    <p className="font-medium text-[11px] text-white truncate">
                      {locOf(d)}
                    </p>
                    <p className="text-white/70 text-[11px] truncate">
                      {addrOf(d)}
                    </p>
                  </div>

                  {/* KANAN: ID + segmen + watt */}
                  <div className="flex items-center flex-wrap gap-2 sm:justify-end sm:pl-4">
                    <span className="text-[10px] text-white/70 max-w-[500px] truncate">
                      {id}
                    </span>
                    <span className="text-[10px] rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white max-w-[200px] truncate">
                      {segOf(d)}
                    </span>
                    <span className="text-[10px] rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white max-w-[200px] truncate">
                      {wattOf(d)}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="p-5 text-center text-white/70 text-[11px]">
            Tidak ada hasil.
          </li>
        )}
      </ul>
    </div>
  );
}

type Props<T> = LegacyProps | GenericProps<T>;

export default function DevicePickerOverlay<T>(props: Props<T>) {
  if (!props.open || typeof document === "undefined") return null;

  const { onClose } = props;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-picker-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {"mode" in props && props.mode === "legacy" ? (
        <LegacyPanel {...props} />
      ) : (
        <GenericPanel {...(props as GenericProps<T>)} />
      )}
    </div>,
    document.body
  );
}
