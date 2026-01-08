"use client";

import React from "react";

export function ValueDisplay({
  value,
  unit = "",
  decimals = 0,
  size = "mid",
  color,
}: {
  value: number | null | undefined;
  unit?: string;
  decimals?: number;
  size?: "big" | "mid";
  color?: string;
}) {
  const isEmpty = value === null || value === undefined || Number.isNaN(value as any);
  const nf = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const num = isEmpty ? "-" : nf.format(Number(value));

  const numClass =
    size === "big"
      ? "text-[clamp(33px,6.5vw,85px)]"
      : "text-[clamp(20px,3.6vw,26px)]";
  const unitClass =
    size === "big"
      ? "text-[clamp(14px,2.6vw,35px)]"
      : "text-[clamp(13px,2.2vw,17px)]";

  return (
    <div
      className="flex items-baseline justify-center gap-2 leading-none whitespace-nowrap"
      aria-live="polite"
      style={{ color }}
    >
      <span className={`font-extrabold tabular-nums ${numClass}`}>{num}</span>
      {unit ? <span className={`font-semibold opacity-85 ${unitClass}`}>{unit}</span> : null}
    </div>
  );
}

export function CurrencyValue({
  value,
  size = "mid",
  color,
  formatter,
  decimals = 2, // 🔹 default 2 digit desimal kayak uang
}: {
  value: number | null | undefined;
  size?: "big" | "mid";
  color?: string;
  formatter?: (v: number | null | undefined) => string;
  decimals?: number;
}) {
  const numClass =
    size === "big"
      ? "text-[clamp(28px,6.5vw,52px)]"
      : "text-[clamp(16px,3.6vw,24px)]";

  const fallback = (
    v: number | null | undefined,
    digits: number
  ): string =>
    v == null || Number.isNaN(v as any)
      ? "-"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(Number(v));

  // kalau kamu kirim formatter sendiri (formatCurrency), itu yang dipakai.
  const out = formatter ? formatter(value) : fallback(value, decimals);

  return (
    <div
      className="flex items-baseline justify-center gap-2 leading-none whitespace-nowrap"
      style={{ color }}
    >
      <span className={`font-extrabold tabular-nums ${numClass}`} aria-live="polite">
        {out}
      </span>
    </div>
  );
}
