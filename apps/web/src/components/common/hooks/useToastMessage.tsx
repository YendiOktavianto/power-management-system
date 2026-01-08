"use client";
import { useState } from "react";

export type ToastKind = "success" | "error" | "danger" | "info" ;
export type ToastData = { open: boolean; kind: ToastKind; title: string; desc?: string };

export default function useToast(autoHideMs = 4200) {
  const [toast, setToast] = useState<ToastData>({ open: false, kind: "info", title: "", desc: "" });

  function show(kind: ToastKind, title: string, desc?: string) {
    setToast({ open: true, kind, title, desc });
    if (autoHideMs > 0) setTimeout(() => setToast((t) => ({ ...t, open: false })), autoHideMs);
  }

  return {
    toast,
    show,
    success: (t: string, d?: string) => show("success", t, d),
    error: (t: string, d?: string) => show("error", t, d),
    info: (t: string, d?: string) => show("info", t, d),
    danger:  (t: string, d?: string) => show("danger", t, d), 
    close: () => setToast((t) => ({ ...t, open: false })),
  };
}
