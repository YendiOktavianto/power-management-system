"use client";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Save, RefreshCw } from "lucide-react";
import {HeaderBarProps} from "../../product-edit/types"

export default function HeaderBar({
  title,
  saving,
  onPreview,
  onUseTemplate,
  onReset,
  onSave,
}: HeaderBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <PageHeader
        title={title}
        align="left"
        className="mb-0"
      />

      <div className="flex items-center gap-3">
        <div>
            <Button
            label="Preview Page"
            variant="secondary"
            size="md"
            radius="xl"
            onClick={onPreview}
            />
        </div>
        <div>
            <Button
            label="Use Template"
            variant="secondary"
            size="md"
            radius="xl"
            onClick={onUseTemplate}
            />
        </div>
        <div>
            <Button
            label="Undo"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            variant="secondary"
            size="md"
            radius="xl"
            onClick={onReset}
            />
        </div>
        <div>
            <Button
            label={saving ? "Saving…" : "Save"}
            leftIcon={<Save className="w-4 h-4" />}
            variant="primary"
            size="md"
            radius="xl"
            onClick={onSave}
            disabled={saving}
            />
        </div>
      </div>
    </div>
  );
}
