"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  label: string;
  active: boolean;
  open: boolean;
  activeIcon: string;   // path icon aktif
  inactiveIcon: string; // path icon normal
  onLabelClick: () => void; // klik kiri
  onToggle: () => void;     // klik chevron
  id: string;               // id submenu container
}>;

export default function CollapsibleSection({
  label,
  active,
  open,
  activeIcon,
  inactiveIcon,
  onLabelClick,
  onToggle,
  id,
  children,
}: Props) {
  return (
    <div className={`rounded-lg mt-1 ${open || active ? "bg-[#141830]" : "bg-transparent"}`}>
      <div className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-[#1A1F37] rounded-lg">
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={onLabelClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (e.currentTarget as HTMLDivElement).click();
            }
          }}
        >
          <img
            src={active ? activeIcon : inactiveIcon}
            alt={label}
            className="w-5 h-5"
          />
          <span className={active ? "text-white font-medium" : "text-gray-300"}>
            {label}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={open}
          aria-controls={id}
        >
          {open ? (
            <ChevronUp size={12} className="text-gray-300" />
          ) : (
            <ChevronDown size={12} className="text-gray-300" />
          )}
        </button>
      </div>

      {open && (
        <div id={id} className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
          {children}
        </div>
      )}
    </div>
  );
}
