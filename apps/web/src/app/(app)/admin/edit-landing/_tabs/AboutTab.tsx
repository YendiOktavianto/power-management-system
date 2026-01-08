// apps/web/src/app/(app)/admin/edit-landing/_tabs/AboutTab.tsx
"use client";

import type { Content } from "../types";
import {
  InputField,
  TextareaField,
  AddRowButton,
  RemoveRowButton,
} from "../_components/FormFields";

export default function AboutTab({
  content,
  setContent,
}: {
  content: Content;
  setContent: (c: Content) => void;
}) {
  return (
    <div className="space-y-4">
      <InputField
        label="Brand"
        value={content.about.brand}
        onChange={(v) =>
          setContent({ ...content, about: { ...content.about, brand: v } })
        }
      />
      <TextareaField
        label="Body"
        value={content.about.body}
        onChange={(v) =>
          setContent({ ...content, about: { ...content.about, body: v } })
        }
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-[#7ec7ff]">Stats</h4>
          <AddRowButton
            label="Add Stat"
            onClick={() =>
              setContent({
                ...content,
                about: {
                  ...content.about,
                  stats: [...content.about.stats, { value: "", text: "" }],
                },
              })
            }
          />
        </div>
        <div className="space-y-3">
          {content.about.stats.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:[grid-template-columns:160px_minmax(0,1fr)_auto] gap-3 items-center"
            >
              <InputField
                label="Value"
                value={s.value}
                onChange={(v) => {
                  const stats = [...content.about.stats];
                  stats[i] = { ...s, value: v };
                  setContent({
                    ...content,
                    about: { ...content.about, stats },
                  });
                }}
              />
              <InputField
                label="Text"
                value={s.text}
                onChange={(v) => {
                  const stats = [...content.about.stats];
                  stats[i] = { ...s, text: v };
                  setContent({
                    ...content,
                    about: { ...content.about, stats },
                  });
                }}
              />
              <RemoveRowButton
                onClick={() => {
                  const stats = content.about.stats.filter((_, idx) => idx !== i);
                  setContent({
                    ...content,
                    about: { ...content.about, stats },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
