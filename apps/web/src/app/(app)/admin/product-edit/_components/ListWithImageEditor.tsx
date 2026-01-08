"use client";

import AddBtn from "./AddBtn";
import RemoveBtn from "./RemoveBtn";
import Input from "./Input";
import Textarea from "./Textarea";
import UploadImage from "./UploadImage";
import { useLocalToast } from "../useProductEdit";

type Schema<T> = { key: keyof T; label: string; type: "input" | "textarea" | "image" };
type Props<T extends Record<string, any>> = {
  title: string;
  items: T[];
  schema: Schema<T>[];
  onAdd: () => void;
  onChange: (items: T[]) => void;
};

export default function ListWithImageEditor<T extends Record<string, any>>({
  title,
  items,
  schema,
  onAdd,
  onChange,
}: Props<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">{title}</h4>
        <AddBtn onClick={onAdd} />
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3 grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.map((f) => {
                if (f.type === "image") {
                  return (
                    <UploadImage
                      key={String(f.key)}
                      label={f.label}
                      value={String(it[f.key] ?? "")}
                      onChange={(url) => {
                        const arr = [...items];
                        arr[i] = { ...arr[i], [f.key]: url };
                        onChange(arr);
                      }}
                      notify={useLocalToast()}
                    />
                  );
                }
                if (f.type === "textarea") {
                  return (
                    <Textarea
                      key={String(f.key)}
                      label={f.label}
                      value={String(it[f.key] ?? "")}
                      onChange={(v) => {
                        const arr = [...items];
                        arr[i] = { ...arr[i], [f.key]: v };
                        onChange(arr);
                      }}
                    />
                  );
                }
                return (
                  <Input
                    key={String(f.key)}
                    label={f.label}
                    value={String(it[f.key] ?? "")}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[i] = { ...arr[i], [f.key]: v };
                      onChange(arr);
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-end">
              <RemoveBtn onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
