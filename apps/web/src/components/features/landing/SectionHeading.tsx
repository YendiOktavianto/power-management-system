"use client";

import React from "react";
import { heading } from "@/components/ui/theme";

type Props = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

export default function SectionHeading({
  children,
  align = "center",
  className,
}: Props) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center";

  return (
    <h2
      className={`text-3xl md:text-4xl font-bold mb-12 ${heading} ${alignClass} ${
        className ?? ""
      }`}
    >
      {children}
    </h2>
  );
}
