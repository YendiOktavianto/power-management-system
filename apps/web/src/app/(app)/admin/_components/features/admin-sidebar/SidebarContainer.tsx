"use client";

import { DEFAULT_BG } from "@/components/ui/theme";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export default function SidebarContainer({ className, children }: Props) {
  return (
    <aside
      className={`w-64 flex flex-col p-3 rounded-t-2xl mt-4 ml-4 h-screen fixed select-none ${className ?? ""}`}
      style={{
        background:
          DEFAULT_BG,
      }}
    >
      {children}
    </aside>
  );
}
