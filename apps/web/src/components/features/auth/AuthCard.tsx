"use client";
import React from "react";

export default function AuthCard({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={
        "px-12 py-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-[440px] text-sm flex flex-col items-center max-h-[96vh] overflow-y-auto custom-scroll " +
        className
      }
    >
      {children}
    </div>
  );
}
