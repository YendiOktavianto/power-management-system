"use client";

import React from "react";

type CardProps = React.PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  /** opsional: langsung isi background gradient/pattern */
  bg?: string;
}>;

export default function Card({ children, className = "", style, bg }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 h-full ring-1 ring-white/10 hover:ring-white/20 transition
                  shadow-[0_10px_35px_rgba(0,0,0,0.25)] backdrop-blur-sm
                  flex flex-col items-center justify-center gap-2 ${className}`}
      style={{ ...(bg ? { background: bg } : {}), ...(style || {}) }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: React.PropsWithChildren) {
  return (
    <p className="uppercase tracking-wider text-[10px] sm:text-[11px] text-white/80 text-center font-semibold">
      {children}
    </p>
  );
}
