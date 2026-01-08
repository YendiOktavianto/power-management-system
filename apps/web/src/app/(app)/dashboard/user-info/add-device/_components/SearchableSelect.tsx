// app/(app)/dashboard/user-info/add-device/components/SearchableSelect.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { INFO_CARD_BG } from "@/components/ui/theme";
import type { Option } from "../types";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  allowClear = true,
}: {
  value: string;
  onChange: (opt: Option | null) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || null;
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
    setActive(0);
  }, [open]);

  const baseBox =
    "p-2 rounded-xl bg-white/5 border border-white/10 text-white w-full text-xs focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`${baseBox} flex items-center justify-between transition-colors hover:bg-white/10`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        title={selected?.label || undefined}
      >
        <span className="truncate"  title={selected?.label || undefined}>
          {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
        </span>

        <span className="ml-2 flex items-center gap-1">
          {allowClear && selected && !disabled && (
            <span
              role="button"
              aria-label="Clear"
              className="px-1 rounded hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              ×
            </span>
          )}
          <svg width="10" height="10" viewBox="0 0 20 20" aria-hidden className="opacity-80">
            <path d="M5 7l5 5 5-5" fill="currentColor" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="absolute z-[999] mt-1 left-0 w-auto min-w-full max-w-[calc(100vw-2rem)] sm:max-w-[40rem] rounded-xl border border-white/10 backdrop-blur-md shadow-xl overflow-hidden"
          style={{ background: INFO_CARD_BG }}
          role="listbox"
        >
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const pick = filtered[active];
                  if (pick) {
                    onChange(pick);
                    setOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Type to filter…"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <ul className="max-h-64 overflow-auto">
            {filtered.length === 0 && <li className="px-3 py-2 text-xs text-white/70">No results</li>}
            {filtered.map((opt, idx) => {
              const isActive = idx === active;
              const isSelected = value === opt.value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  } ${isSelected ? "text-sky-300" : "text-white"} flex items-center justify-between`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  title={opt.label}
                >
                  <span className="whitespace-nowrap pr-4">{opt.label}</span>
                  {isSelected && <span className="opacity-80 shrink-0">✓</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
