"use client";

import AddBtn from "./AddBtn";
import RemoveBtn from "./RemoveBtn";
import Input from "./Input";
import Textarea from "./Textarea";

type Schema<T> = { key: keyof T; label: string; type: "input" | "textarea" };
type Props<T extends Record<string, any>> = {
  title: string;
  items: T[];
  schema: Schema<T>[];
  onAdd: () => void;
  onChange: (items: T[]) => void;
};

export default function ListSimpleEditor<T extends Record<string, any>>({
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
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              {schema.map((f) =>
                f.type === "input" ? (
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
                ) : (
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
                )
              )}
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
