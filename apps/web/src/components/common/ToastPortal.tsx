"use client";

import React, { useEffect, useState } from "react";
import ToastInline from "@/components/common/ToastMessageInline";
import type { ToastData } from "@/components/common/hooks/useToastMessage";

export default function ToastPortal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const [toast, setToast] = useState<ToastData>({
    open: false,
    kind: "info",
    title: "",
    desc: "",
  });

  useEffect(() => {
    if (!message) return;
    const hasError = message.includes("❌");
    const hasSuccess = message.includes("✅");
    const kind: ToastData["kind"] = hasError
      ? "error"
      : hasSuccess
      ? "success"
      : "info";
    const cleaned = message.replace("❌", "").replace("✅", "").trim();

    setToast({
      open: true,
      kind,
      title: cleaned || message,
      desc: "",
    });

    const t = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
      onClose();
    }, 3000);

    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <ToastInline
      toast={toast}
      onClose={() => {
        setToast((prev) => ({ ...prev, open: false }));
        onClose();
      }}
      placement="top-center"
    />
  );
}
