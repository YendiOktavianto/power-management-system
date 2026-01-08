"use client";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  length?: number;                    
  value: (string | undefined)[];      
  onChange: (next: string[]) => void; 
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  ariaDescribedBy?: string;
  onComplete?: (code: string) => void; 
};

export default function PinInput({
  length = 4,
  value,
  onChange,
  disabled,
  autoFocus,
  className = "",
  inputClassName = "",
  ariaDescribedBy,
  onComplete,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  if (refs.current.length < length) {
    refs.current = Array.from({ length }, (_, i) => refs.current[i] ?? null);
  }

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const id = requestAnimationFrame(() => refs.current[0]?.focus());
    return () => cancelAnimationFrame(id);
  }, [autoFocus, disabled]);

  const filledAll = useMemo(
    () => value.slice(0, length).every((c) => (c ?? "").length === 1),
    [value, length]
  );

  useEffect(() => {
    if (filledAll && onComplete) onComplete(value.slice(0, length).join(""));
  }, [filledAll, onComplete, value, length]);

  const setAt = (idx: number, digit: string) => {
    const next = [...value];
    next[idx] = digit;
    onChange(next as string[]);
  };

  return (
    <div
      className={`flex justify-center gap-4 w-full ${className}`}
      aria-describedby={ariaDescribedBy}
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[idx] ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            if (!v) {
              setAt(idx, "");
              return;
            }
            setAt(idx, v);
            if (idx < length - 1) refs.current[idx + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[idx] && idx > 0) {
              refs.current[idx - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && idx > 0) {
              e.preventDefault();
              refs.current[idx - 1]?.focus();
            }
            if (e.key === "ArrowRight" && idx < length - 1) {
              e.preventDefault();
              refs.current[idx + 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!pasted) return;
            const next = [...value];
            let j = idx;
            for (const ch of pasted.slice(0, length - idx)) {
              next[j] = ch;
              j++;
            }
            onChange(next as string[]);
            const firstEmpty = next.findIndex((c, k) => k < length && !c);
            if (firstEmpty >= 0) refs.current[firstEmpty!]?.focus();
            else refs.current[length - 1]?.blur();
          }}
          className={[
            "w-12 h-12 text-center text-white bg-gray-800/60 rounded-lg",
            "outline-none focus:ring-2 focus:ring-[#2196F3] transition-all",
            inputClassName,
          ].join(" ")}
          aria-label={`OTP digit ${idx + 1}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
