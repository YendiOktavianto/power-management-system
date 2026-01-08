"use client";

import React from "react";

type AlignMode = "center" | "left" | "responsive";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  align?: AlignMode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  align = "center",
  className,
}: PageHeaderProps) {
  const justifyClass =
    align === "center"
      ? "justify-center"
      : align === "left"
      ? "justify-start"
      : "justify-center md:justify-start"; 

  const textAlignClass =
    align === "center"
      ? "text-center"
      : align === "left"
      ? "text-left"
      : "text-center md:text-left"; 

  return (
    <div className={`mb-2 flex items-start ${justifyClass} gap-3 ${className ?? ""}`}>
      <div className={`space-y-0.5 ${textAlignClass} w-full max-w-[480px]`}>
        <h2
          className={`
            text-white font-semibold leading-tight
            text-[clamp(16px,2vw,26px)]
            ${textAlignClass}
          `}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={`
              text-white/60 text-[11px] sm:text-xs
              ${textAlignClass}
            `}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
