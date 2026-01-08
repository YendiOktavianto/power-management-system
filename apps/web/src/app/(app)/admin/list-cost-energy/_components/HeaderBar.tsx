"use client";

import { FaPlus } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import ExportXlsButton from "@/components/ui/ExportXlsButton";
import Button from "@/components/ui/Button";

export default function HeaderBar({
  onOpenAdd,
  onExport,
}: {
  onOpenAdd: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title="List Cost Energy"
        align="left"
        className="mb-0"
      />

      <div className="flex items-center gap-2">
        <div>
          {onOpenAdd && (
            <Button
              label = "Update Data"
              leftIcon = {<FaPlus />}
              type="button"
              onClick={onOpenAdd}
              variant="info"
              size="sm"
            >
            </Button>
          )}
        </div>
        <div>
          <ExportXlsButton onClick={onExport} />
        </div>
      </div>
    </div>
  );
}

