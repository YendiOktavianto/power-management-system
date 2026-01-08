"use client";

import type { MenuItem } from "./type";

type Props = {
  items: readonly MenuItem[];
  selectedKey: string;
  onClick: (item: MenuItem) => void;
  afterClick?: () => void; // untuk menutup section lain
};

export default function MainMenu({ items, selectedKey, onClick, afterClick }: Props) {
  return (
    <>
      {items.map((item) => {
        const isActive = selectedKey === item.key;
        return (
          <a
            key={item.key}
            onClick={() => {
              onClick(item);
              afterClick?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLAnchorElement).click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${
              isActive
                ? "bg-[#1A1F37] text-white font-medium"
                : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
            }`}
          >
            <img
              src={isActive ? item.activeIcon : item.icon}
              alt={item.label}
              className="w-5 h-5"
            />
            <span>{item.label}</span>
          </a>
        );
      })}
    </>
  );
}
