"use client";
import React from "react";

export default function ClockPill({ time }: { time: string }) {
  return (
    <div
      className="text-xs text-white px-6 py-2 rounded-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      {time}
    </div>
  );
}
