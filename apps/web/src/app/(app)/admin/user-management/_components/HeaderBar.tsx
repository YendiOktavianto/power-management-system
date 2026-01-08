// app/(app)/admin/user-management/_components/HeaderBar.tsx
"use client";

import PageHeader from "@/components/ui/PageHeader";
import ExportXlsButton from "@/components/ui/ExportXlsButton";
import { FaPlus } from "react-icons/fa";
import {HeaderBarProps} from "../types"
import Button from "@/components/ui/Button";

export default function HeaderBar({ onExport, onAdd }: HeaderBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title="User Management"
        align="left"
        className="mb-0"
      />

      <div className="flex items-center gap-2">
        <div>
        {onAdd && (
          <Button
            label = "Add User"
            leftIcon = {<FaPlus />}
            type="button"
            onClick={onAdd}
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
