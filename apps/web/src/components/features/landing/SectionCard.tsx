"use client";

import React from "react";
import { cardBg, cardBorder } from "@/components/ui/theme";


type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ children, className }: Props) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 flex flex-col gap-3 ${cardBg} ${cardBorder} ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}
