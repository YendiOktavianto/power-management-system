"use client";

import clsx from "clsx";

type Props = {
  timer: number;               
  onResend: () => void;        
  className?: string;
  align?: "left" | "center" | "right";
  size?: "xs" | "sm";
  questionText?: string;      
  activeColorClass?: string;     
};

export default function ResendLink({
  timer,
  onResend,
  className,
  align = "left",
  size = "xs",
  questionText = "Didn't receive the code?",
  activeColorClass = "text-[#2196F3]",
}: Props) {
  const canResend = timer === 0;

  return (
    <p
      className={clsx(
        "text-gray-300 mt-4",
        size === "xs" ? "text-xs" : "text-sm",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {questionText}{" "}
      <button
        type="button"
        onClick={canResend ? onResend : undefined}
        disabled={!canResend}
        className={clsx(
          "select-none underline-offset-2",
          canResend
            ? `${activeColorClass} cursor-pointer hover:underline`
            : "text-gray-400 cursor-not-allowed"
        )}
        aria-disabled={!canResend}
        aria-live="polite"
      >
        {canResend ? "Resend" : `Resend in ${timer}s`}
      </button>
    </p>
  );
}
