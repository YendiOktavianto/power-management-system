"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function HeaderBar({ errMsg }: { errMsg?: string | null }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title="List Device Requests"
        align="left"
      />
      {errMsg && (
        <div className="text-xs px-3 py-1 rounded bg-red-600/80 text-white border border-red-300/40">
          {errMsg}
        </div>
      )}
    </div>
  );
}


