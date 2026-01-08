"use client";
import * as React from "react";

type Props = {
  code: Array<string | null>;
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  onChangeDigit: (idx: number, val: string) => void;
  onKeyDownDigit: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  loading: boolean;
};

export default function OtpInputs({
  code,
  inputRefs,
  onChangeDigit,
  onKeyDownDigit,
  loading,
}: Props) {
  return (
    <div className="flex justify-center gap-4 w-full">
      {code.map((num, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          value={num ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            onChangeDigit(idx, v);
          }}
          onKeyDown={(e) => onKeyDownDigit(idx, e)}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!pasted) return;
            let j = idx;
            for (const ch of pasted.slice(0, code.length - idx)) {
              onChangeDigit(j, ch ?? "");
              j++;
            }
          }}
          className="w-12 h-12 text-center text-white bg-gray-800/60 rounded-lg outline-none focus:ring-2 focus:ring-[#2196F3] transition-all disabled:opacity-60"
          aria-label={`OTP digit ${idx + 1}`}
          disabled={loading}
        />
      ))}
    </div>
  );
}
