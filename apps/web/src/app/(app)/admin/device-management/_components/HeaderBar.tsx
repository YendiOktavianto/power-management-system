"use client";

import { FaFileExcel, FaPlus } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";
import ExportXlsButton from "@/components/ui/ExportXlsButton";
import Button from "@/components/ui/Button";

type Props = {
  title?: string;
  onAddClick: () => void;
  onExportClick: () => void;
};

export default function HeaderBar({
  title = "Device Management",
  onAddClick,
  onExportClick,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title={title}
        align="left"
        className="mb-0"
      />

      <div className="flex items-center gap-2">
        <div>
          <Button
            label = "Add Device"
            leftIcon = {<FaPlus />}
            type="button"
            onClick={onAddClick}
            size="sm"
            variant="info"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full text-white text-xs transition"
          >
          </Button>
        </div>
        <div>
          <ExportXlsButton onClick={onExportClick} />
        </div>
      </div>
    </div>
  );
}
