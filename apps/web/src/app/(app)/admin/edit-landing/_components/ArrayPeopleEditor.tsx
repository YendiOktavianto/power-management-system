// apps/web/src/app/(app)/admin/edit-landing/_components/ArrayPeopleEditor.tsx
"use client";

import useToast from "@/components/common/hooks/useToastMessage";
import UploadMediaWithTemplates, { type TemplateItem } from "./UploadMediaWithTemplates";
import { InputField, AddRowButton, RemoveRowButton } from "./FormFields";

type Person = {
  name: string;
  role: string;
  img?: string;
  number?: string;
};

export type ArrayPeopleEditorProps = {
  title: string;
  items: Person[];
  onChange: (items: Person[]) => void;
  phoneField?: boolean;
  showTemplates?: boolean;
  avatarTemplates?: TemplateItem[];
  templateEndpoint?: string;
  templateGroups?: string[];
};

export default function ArrayPeopleEditor({
  title,
  items,
  onChange,
  phoneField = false,
  showTemplates = false,
  avatarTemplates = [],
  templateEndpoint,
  templateGroups,
}: ArrayPeopleEditorProps) {
  const toast = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">{title}</h4>
        <AddRowButton
          label="Add"
          onClick={() => {
            onChange([
              ...items,
              { name: "", role: "", img: "/profile.svg", ...(phoneField ? { number: "" } : {}) },
            ]);
            toast.info("Row added");
          }}
        />
      </div>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl border border-white/10 p-3 grid gap-3 grid-cols-1 ${
              phoneField
                ? "md:[grid-template-columns:repeat(3,minmax(0,1fr))_minmax(0,1fr)_auto]"
                : "md:[grid-template-columns:repeat(3,minmax(0,1fr))_auto]"
            }`}
          >
            <InputField
              label="Name"
              value={p.name}
              onChange={(v) => {
                const arr = [...items];
                arr[i] = { ...p, name: v };
                onChange(arr);
              }}
            />
            <InputField
              label="Role"
              value={p.role}
              onChange={(v) => {
                const arr = [...items];
                arr[i] = { ...p, role: v };
                onChange(arr);
              }}
            />
            {phoneField && (
              <InputField
                label="Phone (62...)"
                value={p.number ?? ""}
                onChange={(v) => {
                  const arr = [...items];
                  arr[i] = { ...p, number: v };
                  onChange(arr);
                }}
              />
            )}
            <UploadMediaWithTemplates
              label="Photo"
              value={p.img ?? "/profile.svg"}
              onChange={(url) => {
                const arr = [...items];
                arr[i] = { ...p, img: url };
                onChange(arr);
              }}
              showTemplates={showTemplates}
              templates={avatarTemplates}
              templateEndpoint={templateEndpoint}
              templateGroups={templateGroups}
              notify={toast}
            />
            <RemoveRowButton
              onClick={() => {
                const arr = items.filter((_, idx) => idx !== i);
                onChange(arr);
                toast.info("Row deleted");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
