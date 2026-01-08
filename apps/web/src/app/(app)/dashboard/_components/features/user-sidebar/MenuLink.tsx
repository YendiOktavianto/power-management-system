"use client";
import React from "react";

type Props = {
  active: boolean;
  icon: string;
  activeIcon: string;
  label: string;
  onClick: () => void;
};

export default function MenuLink({ active, icon, activeIcon, label, onClick }: Props) {
  return (
    <a
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          (e.currentTarget as HTMLAnchorElement).click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${
        active ? "bg-[#1A1F37] text-white font-medium" : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
      }`}
    >
      <img src={active ? activeIcon : icon} alt={label} className="w-5 h-5" />
      <span>{label}</span>
    </a>
  );
}
