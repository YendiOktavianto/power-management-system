"use client";

export type MenuItem = {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
  path: string;
};

export type SubItem = {
  key: string;
  label: string;
  path?: string; // optional untuk Power (pakai hash, tidak perlu path)
};
