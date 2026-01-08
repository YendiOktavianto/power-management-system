"use client";
import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function Label({ children, className = "" }: Props) {
  return (
    <p className={`uppercase tracking-widest text-white/70 text-[9px] ${className}`}>
      {children}
    </p>
  );
}
