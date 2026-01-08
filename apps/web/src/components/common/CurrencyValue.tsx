"use client";
import React from "react";
import { formatCurrency } from "@/app/(app)/dashboard/home/validation";

type Props = {
  value: number | null | undefined;
  size?: "big" | "mid";
  color?: string;
};

export default function CurrencyValue({ value, size = "mid", color }: Props) {
  const numClass =
    size === "big"
      ? "text-[clamp(28px,6.5vw,52px)]"
      : "text-[clamp(16px,3.6vw,24px)]";
  return (
    <div className="flex items-baseline justify-center gap-2 leading-none" style={{ color }}>
      <span className={`font-extrabold tabular-nums ${numClass}`} aria-live="polite">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
