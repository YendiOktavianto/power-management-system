"use client";

import React from "react";
import { sectionBg, sectionAltBg } from "@/components/ui/theme";


type Props = {
  id?: string;
  children: React.ReactNode;
  withBg?: boolean;
  altBg?: boolean;
  className?: string;
  innerClassName?: string;
  maxWidthClassName?: string;
};

export default function SectionShell({
  id,
  children,
  withBg,
  altBg,
  className,
  innerClassName,
  maxWidthClassName,
}: Props) {
  const bgClass = withBg
    ? altBg
      ? sectionAltBg
      : sectionBg
    : "";

  const maxWidth = maxWidthClassName ?? "max-w-6xl";

  return (
    <section
      id={id}
      className={`py-16 sm:py-20 ${bgClass} ${className ?? ""}`}
    >
      <div
        className={`${maxWidth} mx-auto px-4 sm:px-6 ${
          innerClassName ?? ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
