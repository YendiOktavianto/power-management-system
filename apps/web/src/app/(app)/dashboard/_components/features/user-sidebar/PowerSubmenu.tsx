"use client";
import React from "react";
import { Circle } from "lucide-react";

type Props = {
  items: readonly string[];
  activeKey: string;
  onSelect: (key: string) => void;
};

export default function PowerSubmenu({ items, activeKey, onSelect }: Props) {
  return (
    <div id="power-submenu" className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
      <div className="flex flex-col space-y-0.5">
        {items.map((sub) => {
          const activeSub = activeKey === sub;
          return (
            <a
              key={sub}
              onClick={() => onSelect(sub)}
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
              <span>{sub}</span>
              {activeSub && <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
