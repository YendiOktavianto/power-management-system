"use client";

import React from "react";

export function Label({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <p className={`uppercase tracking-widest text-white/70 text-[9px] ${className}`}>
      {children}
    </p>
  );
}

export function LabeledValue({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-white/70">{label}</span>
      {children}
    </div>
  );
}
