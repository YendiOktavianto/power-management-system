"use client";

import React from "react";
import Button from "../../ui/Button"

type Props = {
  show: boolean;
  deviceId?: string | null;
  locationLabel?: string | null;
  onChange: () => void;
};

export default function DeviceHud({
  show,
  deviceId,
  locationLabel,
  onChange,
}: Props) {
  if (!show) return null;

  const sn = deviceId ?? "-";
  const loc = locationLabel ?? "-";

  return (
    <div className="fixed left-1/2 -translate-x-1/4 top-6 z-50 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto rounded-lg ring-1 ring-white/10 shadow-md px-2.5 py-1.5 text-[10px] 
        sm:text-[11px] text-white max-w-[92vw] sm:max-w-[490px] supports-[backdrop-filter]:backdrop-blur-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded bg-white/10 border border-white/10 text-[9px]">
            SN
          </span>
          <span
            className="font-mono font-medium truncate break-all"
            title={sn}
          >
            {sn}
          </span>
          <span className="opacity-60">•</span>
          <span
            className="
              min-w-0
              whitespace-normal break-words
              sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis
              font-medium
            "
            title={loc}
          >
            {loc}
          </span>
          <div>
            <Button
                label="Change"
                variant="secondary"
                radius="md"
                onClick={onChange}
                aria-label="Change location"
                title="Change location"
                size="xs"
            >
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
