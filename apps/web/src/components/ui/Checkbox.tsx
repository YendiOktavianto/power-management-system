"use client";

import { forwardRef } from "react";

type Props = {
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
};

const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  {
    label,
    checked,
    onChange,
    name,
    id,
    disabled,
    className,
    wrapperClassName = "flex items-center gap-2 cursor-pointer",
  },
  ref
) {
  return (
    <label className={wrapperClassName}>
      <input
        ref={ref}
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={
          className ??
          "w-3 h-3 rounded-3xl border-[#414141] accent-[#2196F3]"
        }
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
});

export default Checkbox;
