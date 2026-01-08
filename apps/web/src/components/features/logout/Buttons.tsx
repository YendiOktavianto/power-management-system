"use client";

import React from "react";
import Button from "@/components/ui/Button";

type Props = {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function Buttons({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="flex justify-center gap-4 m-5">
      <Button
        onClick = {onCancel}
        variant = "secondary"
        size="md"
        radius="xl"
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        variant = "primary"
        size="md"
        radius="xl"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
