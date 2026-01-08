"use client";

import type { ReactNode } from "react";

export default function AboutWrapper({ children }: { children: ReactNode }) {
  return (
    <section
      id="about"
      className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-center"
    >
      {children}
    </section>
  );
}
