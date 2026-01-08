"use client";
import * as theme from "@/components/ui/theme";

type Props = {
  variant: 1 | 2;
  value?: string;
  text: string;
};

export default function ProductTile({ variant, value, text }: Props) {
  const base =
    "rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 p-10 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 flex flex-col";

  return (
    <div
      className={
        variant === 1
          ? `${base} items-start justify-center text-start`
          : `${base} items-start justify-start text-start`
      }
    >
      {variant === 1 && (
        <h3
          className={`text-7xl font-semibold mb-4 ${theme.heading}`}
        >
          {value}
        </h3>
      )}
      <p
        className={`leading-relaxed max-w-3xl text-sm ${theme.body}`}
      >
        {text}
      </p>
    </div>
  );
}
