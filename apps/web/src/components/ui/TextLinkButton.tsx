"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Props = {
  label: string;                 
} & ButtonHTMLAttributes<HTMLButtonElement>;

const TextLinkButton = forwardRef<HTMLButtonElement, Props>(function TextLinkButton(
  { label, className = "", ...rest },
  ref
) {
  const base = "text-blue-400 hover:underline text-xs";
  return (
    <button ref={ref} className={`${base} ${className}`} {...rest}>
      {label}
    </button>
  );
});

export default TextLinkButton;
