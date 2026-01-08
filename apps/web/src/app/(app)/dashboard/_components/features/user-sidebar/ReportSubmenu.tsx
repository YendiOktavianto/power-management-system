"use client";
import React from "react";
import { Circle } from "lucide-react";

type Item = { key: string; label: string; path: string };
type Props = {
  items: readonly Item[];
  activeKey: string;
  onSelect: (item: Item) => void;
};

export default function ReportSubmenu({ items, activeKey, onSelect }: Props) {
  return (
    <div id="report-submenu" className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
      <div className="flex flex-col space-y-0.5">
        {items.map((rep) => {
          const activeSub = activeKey === rep.key;
          return (
            <a
              key={rep.key}
              onClick={() => onSelect(rep)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLAnchorElement).click();
                }
              }}
              role="button"
              tabIndex={0}
              className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
                activeSub ? "text-blue-400 font-medium bg-[#1A1F37]" : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
              }`}
            >
              <Circle
                size={5}
                className={`absolute left-7 ${activeSub ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"}`}
                fill={activeSub ? "#60a5fa" : "none"}
              />
              <span>{rep.label}</span>
              {activeSub && <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
