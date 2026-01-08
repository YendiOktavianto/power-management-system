// ExportXlsButton.tsx
"use client";

import React from "react";
import { FaFileExcel } from "react-icons/fa";
import Button from "@/components/ui/Button";

type Props = {
  onClick: () => void;
};

export default function ExportXlsButton({ onClick }: Props) {
  return (
    <Button
      label ="Export XLS"
      leftIcon = {<FaFileExcel/>}
      size="sm"
      variant="export_excel"
      onClick={onClick}
      className=""
    >
    </Button>
  );
}
