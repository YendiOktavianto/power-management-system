"use client";

import React, { PropsWithChildren } from "react";
import { DEFAULT_BG } from "./theme";

type ScrollMode = "window" | "container";

type AppPageShellProps = PropsWithChildren<{
  className?: string;
  scroll?: ScrollMode;
}>;

export default function AppPageShell({
  children,
  className,
  scroll = "container",
}: AppPageShellProps) {
  const sizeAndScrollClass =
    scroll === "container"
      ? "min-h-[80dvh] md:h-[82dvh] md:max-h-[100dvh] overflow-auto md:overflow-hidden"
      : "";

  return (
    <div
      className={`
        relative
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border mb-4
        ${sizeAndScrollClass}
        p-5 sm:p-5
        pb-[max(env(safe-area-inset-bottom),12px)]
        text-white
        ${className ?? ""}
      `}
      style={{ background: DEFAULT_BG }}
    >
      {children}
    </div>
  );
}
