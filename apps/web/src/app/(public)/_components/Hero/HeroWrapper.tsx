"use client";

import type { ReactNode } from "react";

export default function HeroWrapper({ children }: { children: ReactNode }) {
  return (
    <section className="relative pt-39 pb-32 px-6 md:px-12 text-center overflow-hidden">
      {children}
    </section>
  );
}
