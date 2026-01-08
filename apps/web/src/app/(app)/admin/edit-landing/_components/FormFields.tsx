"use client";

import { Plus, Trash2 } from "lucide-react";

export function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <input
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <textarea
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
      <select
        className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AddRowButton({
  onClick,
  label = "Add",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1d9bf0]/40 text-[#7ec7ff] hover:bg-[#072b56]/40"
    >
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

export function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-red-500/30 text-red-300 hover:bg-red-900/20 px-3 py-2"
      title="Remove"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
