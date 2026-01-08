"use client";

import InlineEditButton from "@/components/ui/Button";

export default function AccountRow({
  label,
  value,
  onEdit,
  show,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  show: boolean;
}) {
  return (
    <div className="grid grid-cols-12 items-center py-2">
      <div className="col-span-4 text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </div>

      <div className="col-span-6 min-w-0 text-[13px] sm:text-sm font-medium break-words">
        {show ? value : ""}
      </div>

      <div className="col-span-2 flex justify-end ml-11">
        {show && onEdit && (
          <InlineEditButton label="Edit" size="xs" variant="secondary" radius="md" onClick={onEdit}>         
          </InlineEditButton>
        )}
      </div>
    </div>
  );
}
