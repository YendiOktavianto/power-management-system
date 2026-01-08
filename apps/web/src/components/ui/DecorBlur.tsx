"use client";

import React from "react";

export default function DecorBlur({
  className = "pointer-events-none absolute inset-0 opacity-[0.12]",
}: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-blue-400/40" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-indigo-400/40" />
    </div>
  );
}
