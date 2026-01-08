import React from "react";
import {Props} from "./../types";

export default function Row({ icon, label, value, mono }: Props) {
  return (
    <div className="flex items-start gap-3 py-1.5 first:pt-0 last:pb-0">
      {icon && <span className="mt-0.5 h-4 w-4 text-white/70">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-white/50">{label}</p>
        <div
          className={[
            "text-[9px] sm:text-sm text-white/80",
            mono ? "font-mono break-all" : "font-medium break-words",
          ].join(" ")}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
