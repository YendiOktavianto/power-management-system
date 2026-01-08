"use client";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  left: React.ReactNode;           // isi kiri (ikon + label)
  open: boolean;                   // status open
  onClickLeft: () => void;         // klik area kiri
  onToggle: () => void;            // klik chevron
};

export default function SectionHeaderChevron({ left, open, onClickLeft, onToggle }: Props) {
  return (
    <div className="flex w-full items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#1A1F37] rounded-lg">
      <div
        className="flex items-center gap-3 flex-1"
        onClick={onClickLeft}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (e.currentTarget as HTMLDivElement).click();
          }
        }}
      >
        {left}
      </div>

      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-expanded={open}>
        {open ? <ChevronUp size={12} className="text-gray-300" /> : <ChevronDown size={12} className="text-gray-300" />}
      </button>
    </div>
  );
}
