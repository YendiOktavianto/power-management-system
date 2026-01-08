"use client";
import { forwardRef, type ElementType } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghostOutline" | "primaryOutline" | "solid" | "primary2" ;
type Size = "sm" | "md" | "lg";

const variantMap: Record<Variant, string> = {
  // NEW aliases for hero
  primary: "bg-[#1d9bf0] hover:bg-[#1277c9] text-white shadow-lg shadow-blue-900/40",
  secondary: "border border-[#6fb6ff] hover:bg-[#06294f]/40 text-[#e6f5ff]",
  primary2: "bg-gradient-to-r from-[#1d9bf0] to-[#1277c9] hover:opacity-90 shadow-md shadow-[#1d9bf0]/30 text-white",

  // Back-compat
  solid: "bg-[#1d9bf0] hover:bg-[#1780c7] text-white border border-transparent",
  primaryOutline: "border border-[#6fb6ff] text-[#e6f5ff] hover:bg-[#06294f]/40",
  ghostOutline: "border border-[#1d9bf0]/30 text-[#cfe9ff] hover:bg-[#06294f]/30",
};

const sizeMap: Record<Size, string> = {
  sm: "px-3 py-2 text-xs rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl mt-8",
  lg: "px-6 py-3 font-medium rounded-xl mt-3",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: ElementType;          // optional: render as "a", "div", etc.
  href?: string;             // kalau as="a"
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const Button = forwardRef<any, Props>(function Button(
  { className, as: Tag = "button", href, variant = "primary", size = "md", loading, children, disabled, ...rest },
  ref
) {
  const base =
    "inline-flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#6fb6ff]/60 disabled:opacity-60 disabled:cursor-not-allowed";
  const Comp: any = Tag;

  return (
    <Comp
      ref={ref}
      href={Tag === "a" ? href : undefined}
      className={cn(base, variantMap[variant], sizeMap[size], className)}
      aria-busy={loading || undefined}
      disabled={Tag === "button" ? disabled || loading : undefined}
      {...rest}
    >
      {loading ? "Loading..." : children}
    </Comp>
  );
});

export default Button;
