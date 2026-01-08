"use client";

import React from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

export default function StatusBadge({ active }: { active: boolean | undefined }) {
  const state = active === true ? "active" : active === false ? "inactive" : "unknown";
  const color =
    state === "active"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-rose-500/15 text-rose-400";
  const neutral = "bg-zinc-500/15 text-zinc-300";
  const Icon = state === "active" ? CheckCircle2 : state === "inactive" ? XCircle : HelpCircle;
  const label = state === "active" ? "Active" : state === "inactive" ? "Inactive" : "Unknown";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        state === "unknown" ? neutral : color
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
