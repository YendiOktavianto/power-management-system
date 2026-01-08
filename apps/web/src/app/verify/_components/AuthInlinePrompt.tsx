"use client";
import clsx from "clsx";

type Props = {
  text: string;
  actionLabel: string;
  onAction?: () => void;
  className?: string;
  align?: "left" | "center" | "right";
  size?: "xs" | "sm";
  as?: "p" | "div";
  underlineOnHover?: boolean;
  disabled?: boolean;
};

export default function AuthInlinePrompt({
  text,
  actionLabel,
  onAction,
  className,
  align = "left",
  size = "xs",
  as = "p",
  underlineOnHover = true,
  disabled = false,
}: Props) {
  const Wrapper = as;
  return (
    <Wrapper
      className={clsx(
        "text-gray-300 mt-4",
        size === "xs" ? "text-xs" : "text-sm",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {text}{" "}
      <button
        type="button"
        onClick={disabled ? undefined : onAction}
        aria-disabled={disabled}
        className={clsx(
          "select-none",
          disabled ? "text-gray-400 cursor-not-allowed" : "text-[#2196F3]",
          !disabled && underlineOnHover && "hover:underline"
        )}
      >
        {actionLabel}
      </button>
    </Wrapper>
  );
}
