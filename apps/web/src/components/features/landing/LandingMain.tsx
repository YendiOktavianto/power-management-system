"use client";

import type { ReactNode } from "react";
import { LANDING_MAIN_BG } from "@/components/ui/theme";

type Props = {
  children: ReactNode;
};

export default function LandingMain({ children }: Props) {
  return (
    <main
      className={`relative min-h-screen text-white font-poppins overflow-x-hidden ${LANDING_MAIN_BG}`}
    >
      {children}
    </main>
  );
}
