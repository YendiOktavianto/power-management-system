"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import {BTN} from "./theme";

type Variant = "primary" | "secondary" | "danger" | "delete" | "success" | "info" | "export_excel";
type Size = "xs" | "sm" | "md" | "lg";
type Align = "start" | "center" | "end" ;
type Radius = "none" | "sm" | "md" | "lg" | "xl" | "full";

type Props = {
  label?: ReactNode;               
  loading?: boolean;          
  loadingLabel?: ReactNode;     
  leftIcon?: ReactNode;        
  rightIcon?: ReactNode;      
  spinner?: ReactNode;       
  fullWidth?: boolean;         
  variant?: Variant;           
  size?: Size;      
  align?: Align;    
  radius?: Radius;     
  children?: ReactNode;               
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const VARIANT: Record<Variant, string> = {
  primary:  BTN.primary,
  secondary: BTN.secondary,
  danger: BTN.danger,
  delete:BTN.delete,
  success:BTN.success,
  info: BTN.info,
  export_excel: BTN.export_excel,
};

const ALIGN: Record<Align, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const SIZE: Record<Size, string> = {
  xs: "h-6 px-2.5 text-[9px]",
  sm: "h-8 px-4 text-[13px]",
  md: "h-9 px-5 text-[14px]",
  lg: "h-12 px-6 text-[14px]",
};

const RADIUS: Record<Radius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const base =
  "inline-flex items-center font-semibold shadow " +
  "transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300";

const SubmitButton = forwardRef<HTMLButtonElement, Props>(function SubmitButton(
  {
    label,
    loading = false,
    loadingLabel,
    leftIcon,
    rightIcon,
    spinner,
    className = "",
    disabled,
    fullWidth = true,
    variant = "primary",
    size = "lg",
    align = "center",
    radius = "full", 
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  const content = label ?? children; 
  const liveLabel = loadingLabel ?? content;

  return (
    <button
      ref={ref}
      type="submit"
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      className={[
        base,
        VARIANT[variant],
        SIZE[size],
        ALIGN[align],
        RADIUS[radius],
        fullWidth ? "w-full" : "",
        "mt-1", 
        className,
      ].join(" ")}
      {...rest}
    >
      {loading && (
        <>
          {spinner ?? (
            <svg
              className="mr-2 animate-spin"
              width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          )}
          <span className="sr-only" aria-live="polite">
            {loadingLabel ?? label}
          </span>
        </>
      )}

      {!loading && leftIcon ? <span className="mr-2">{leftIcon}</span> : null}

      {loading ? liveLabel : content}

      {!loading && rightIcon ? <span className="ml-2">{rightIcon}</span> : null}
    </button>
  );
});

export default SubmitButton;
