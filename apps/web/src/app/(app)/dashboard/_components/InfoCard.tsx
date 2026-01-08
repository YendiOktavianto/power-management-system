"use client";

import type { ReactNode } from "react";
import { INFO_CARD_BG } from "@/components/ui/theme";

type InfoCardProps = {
  title?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact";
  align?: "center" | "left";
};

export default function InfoCard({
  title,
  rightSlot,
  children,
  className,
  variant = "default",
  align = "center",
}: InfoCardProps) {
  const paddingClass =
    variant === "compact" ? "p-3 sm:p-4" : "p-4";

  const textAlignClass =
    align === "center" ? "text-center" : "text-left";

  return (
    <section
      className={`
        rounded-2xl border border-white/10 backdrop-blur-md
        ${paddingClass}
        ${textAlignClass}
        ${className ?? ""}
      `}
      style={{ background: INFO_CARD_BG }}
    >
      {title && (
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-[10px] tracking-widest text-white/60 uppercase font-bold">
            {title}
          </h3>
          {rightSlot}
        </div>
      )}

      {children}
    </section>
  );
}
