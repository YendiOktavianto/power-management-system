"use client";

import PageHeader from "@/components/ui/PageHeader";
import ExportXlsButton from "@/components/ui/ExportXlsButton";

export default function HeaderBar({ onExport }: { onExport: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title="Energy Usage Report"
        align="left"
      />
      <div>
        <ExportXlsButton onClick={onExport} />
      </div>
    </div>
  );
}
