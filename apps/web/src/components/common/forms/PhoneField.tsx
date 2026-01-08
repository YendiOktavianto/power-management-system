"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, { useRef } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
};

export default function PhoneField({
  value,
  onChange,
  error,
  placeholder = "Phone Number",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasErr = Boolean(error);

  return (
    <div className="w-full">
      <div
        className={[
          "relative flex items-center h-12 rounded-full px-3 text-white transition bg-gray-800 border",
          hasErr
            ? "border-red-500 ring-2 ring-red-500 focus-within:ring-red-500"
            : "border-white/0 focus-within:ring-2 focus-within:ring-blue-500",
        ].join(" ")}
      >
        <PhoneInput
          country="id"
          onlyCountries={["id"]}
          disableDropdown
          countryCodeEditable={false}
          value={value}
          onChange={(phone) => {
            let p = phone.replace(/\s+/g, "");
            p = p.startsWith("+") ? p : "+" + p;
            if (!p.startsWith("+62")) p = "+62" + p.replace(/^\+?62?/, "");
            onChange(p);
          }}
          onKeyDown={(e: any) => {
            const el = inputRef.current;
            if (!el) return;
            const caret = el.selectionStart ?? 0;
            if ((e.key === "Backspace" && caret <= 3) || (e.key === "Delete" && caret < 3)) {
              e.preventDefault();
            }
          }}
          inputProps={{
            ref: (r: any) => (inputRef.current = r),
            name: "phone_number",
            autoComplete: "tel",
            "aria-invalid": hasErr || undefined,
            "aria-describedby": hasErr ? "phone-error" : undefined,
          }}
          placeholder={placeholder}
          containerClass="!w-full"
          inputClass={[
            "!bg-transparent !outline-none !w-full !h-12 !pl-11 !text-[14px] !text-white",
            "!border-0 !shadow-none !rounded-full",
            hasErr ? "!placeholder-red-300" : "!placeholder-gray-400",
          ].join(" ")}
          buttonClass="!bg-transparent !border-0 !h-12 !ml-[-3px] !outline-none !pointer-events-none !cursor-default focus:!outline-none focus:!ring-0"
          dropdownClass="!bg-[#282C32] !text-white !rounded-sm"
        />
      </div>

      {hasErr && (
        <p id="phone-error" className="text-red-400 text-[11px] mt-1 ml-4">
          {error}
        </p>
      )}
    </div>
  );
}
