"use client";

import clsx from "clsx";
import TextLinkButton from "@/components/ui/TextLinkButton";
import type { ReactNode } from "react";

type Props = {
  text: ReactNode;
  actionLabel: string;
  onAction: () => void;
  align?: "left" | "center" | "right";
  size?: "xs" | "sm";
  className?: string;
};

export default function AuthInlinePrompt({
  text,
  actionLabel,
  onAction,
  align = "left",
  size = "xs",
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "text-gray-300 mt-4",
        size === "xs" ? "text-xs" : "text-sm",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {text}{" "}
      <TextLinkButton label={actionLabel} onClick={onAction} />
    </div>
  );
}
