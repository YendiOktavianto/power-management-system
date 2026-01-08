"use client";

import { Circle } from "lucide-react";
import type { SubItem } from "./type";

type Props = {
  items: readonly SubItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export default function SubmenuList({ items, selectedKey, onSelect }: Props) {
  return (
    <div className="flex flex-col space-y-0.5">
      {items.map((it) => {
        const activeSub = selectedKey === it.key;
        return (
          <a
            key={it.key}
            onClick={() => onSelect(it.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLAnchorElement).click();
              }
            }}
            role="button"
            tabIndex={0}
            className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
              activeSub
                ? "text-blue-400 font-medium bg-[#1A1F37]"
                : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
            }`}
          >
            <Circle
              size={5}
              className={`absolute left-7 ${
                activeSub
                  ? "text-blue-400"
                  : "text-gray-500 group-hover:text-blue-400"
              }`}
              fill={activeSub ? "#60a5fa" : "none"}
            />
            <span>{it.label}</span>
            {activeSub && (
              <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />
            )}
          </a>
        );
      })}
    </div>
  );
}
