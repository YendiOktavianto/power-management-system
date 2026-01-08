"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CARD_BG } from "@/components/ui/theme";

export default function ModalPortal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[50] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80"
    >
      <div
        className="
          relative z-[51] w-full max-w-md
          max-h-[calc(100dvh-2rem)] sm:max-h-[85dvh]
          overflow-y-auto overscroll-contain custom-scroll
          rounded-2xl border border-white/10 backdrop-blur-md p-6 text-white
        "
        style={{ background: CARD_BG }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
