"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Size = "lg" | "md";
const sizeMap = {
  lg: { wrapper: "h-12 px-4", input: "text-[14px]" },
  md: { wrapper: "h-10 px-4", input: "text-[14px]" },
};

type Variant = "auth" | "dashboard";

const variantMap: Record<
  Variant,
  { wrapper: string; label: string; input: string }
> = {
  auth: {
    wrapper: "bg-gray-800 rounded-full text-white",
    label: "block text-xs text-gray-300 mb-1 ml-4",
    input: "placeholder-gray-400",
  },
  dashboard: {
    wrapper: "bg-white/5 border border-white/10 rounded-xl text-white",
    label: "block text-[10px] text-white mb-1",
    input: "placeholder-white/50",
  },
};

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  size?: Size;
  variant?: Variant;
  passwordToggle?: boolean;
  showPassword?: boolean;        
  onTogglePassword?: () => void;  

  asChild?: boolean;
  children?: ReactNode;
};

type Props = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">;

const FormInput = forwardRef<HTMLInputElement, Props>(function FormInput(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    containerClassName,
    inputClassName,
    size = "lg",
    variant = "auth",
    type = "text",
    passwordToggle = false,
    showPassword,
    onTogglePassword,
    asChild = false,
    id,
    children,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const [localShow, setLocalShow] = useState(false);
  const isControlled = typeof showPassword === "boolean";
  const effectiveShow = isControlled ? !!showPassword : localShow;

  const effectiveType =
    passwordToggle && type === "password"
      ? effectiveShow
        ? "text"
        : "password"
      : type;

  const describedBy = [
    error ? `${inputId}-error` : null,
    hint ? `${inputId}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const sz = sizeMap[size];
  const vs = variantMap[variant];

  const inputNode = asChild ? (
    <div className="w-full">
      {children}
    </div>
  ) : (
    <input
      id={inputId}
      ref={ref}
      type={effectiveType}
      aria-invalid={!!error}
      aria-describedby={describedBy || undefined}
      className={[
        "bg-transparent outline-none w-full",
        sz.input,
        vs.input,
        inputClassName || "",
      ].join(" ")}
      {...rest}
    />
  );

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className={vs.label}>
          {label}
        </label>
      )}

      <div
        className={[
          "relative flex items-center",
          "focus-within:ring-2 focus-within:ring-blue-500 transition",
          error ? "ring-2 ring-red-500" : "",
          sz.wrapper,
          vs.wrapper,
        ].join(" ")}
      >
        {leftIcon ? (
          <div className="mr-3 opacity-70 flex items-center">{leftIcon}</div>
        ) : null}

        {inputNode}

        {rightIcon ? <div className="ml-3">{rightIcon}</div> : null}

        {!asChild && passwordToggle && type === "password" && (
          <button
            type="button"
            aria-label={effectiveShow ? "Hide password" : "Show password"}
            onClick={
              isControlled
                ? onTogglePassword
                : () => setLocalShow((s) => !s)
            }
            className="absolute right-5 text-gray-300 hover:text-white"
            tabIndex={-1}
          >
            {effectiveShow ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          className="text-[11px] text-gray-400 mt-1 ml-4"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-400 text-[11px] mt-1 ml-4"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default FormInput;
