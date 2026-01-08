"use client";

import { ReactNode } from "react";

export default function MapContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        mx-auto
        min-h-[100%]
        overflow-hidden
        pb-[max(env(safe-area-inset-bottom),0px)]
      "
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <div className="w-full h-full shadow-lg overflow-hidden" style={{ height: "85.5vh" }}>
        {children}
      </div>
    </div>
  );
}
