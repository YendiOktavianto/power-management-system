"use client";
import React from "react";

export default function CardTitle({ children }: React.PropsWithChildren) {
  return (
    <p className="uppercase tracking-wider text-[10px] sm:text-[11px] text-white/80 text-center font-semibold">
      {children}
    </p>
  );
}
