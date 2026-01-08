// apps/web/src/app/(app)/admin/edit-landing/_tabs/FeaturesTab.tsx
"use client";

import type { Content, FeatureIconKey } from "../types";
import { ICON_OPTIONS } from "../constants";
import {
  InputField,
  TextareaField,
  SelectField,
  AddRowButton,
  RemoveRowButton,
} from "../_components/FormFields";

export default function FeaturesTab({
  content,
  setContent,
}: {
  content: Content;
  setContent: (c: Content) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 p-3 bg-white/5">
        <h4 className="text-sm font-medium text-[#7ec7ff] mb-3">
          Features Intro (for /features page)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            label="Eyebrow"
            value={content.featuresIntro.eyebrow}
            onChange={(v) =>
              setContent({
                ...content,
                featuresIntro: {
                  ...content.featuresIntro,
                  eyebrow: v,
                },
              })
            }
          />
          <InputField
            label="Headline"
            value={content.featuresIntro.headline}
            onChange={(v) =>
              setContent({
                ...content,
                featuresIntro: {
                  ...content.featuresIntro,
                  headline: v,
                },
              })
            }
          />
        </div>
        <div className="mt-3">
          <TextareaField
            label="Body"
            rows={4}
            value={content.featuresIntro.body}
            onChange={(v) =>
              setContent({
                ...content,
                featuresIntro: {
                  ...content.featuresIntro,
                  body: v,
                },
              })
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#7ec7ff]">Features</h4>
        <AddRowButton
          label="Add Feature"
          onClick={() =>
            setContent({
              ...content,
              features: [
                ...content.features,
                { iconKey: "FaBolt", title: "", desc: "" },
              ],
            })
          }
        />
      </div>
      <div className="space-y-3">
        {content.features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 p-3 grid grid-cols-1 md:[grid-template-columns:160px_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3"
          >
            <SelectField
              label="Icon"
              value={f.iconKey}
              options={ICON_OPTIONS}
              onChange={(v) => {
                const features = [...content.features];
                features[i] = {
                  ...f,
                  iconKey: v as FeatureIconKey,
                };
                setContent({ ...content, features });
              }}
            />
            <InputField
              label="Title"
              value={f.title}
              onChange={(v) => {
                const features = [...content.features];
                features[i] = { ...f, title: v };
                setContent({ ...content, features });
              }}
            />
            <InputField
              label="Description"
              value={f.desc}
              onChange={(v) => {
                const features = [...content.features];
                features[i] = { ...f, desc: v };
                setContent({ ...content, features });
              }}
            />
            <RemoveRowButton
              onClick={() => {
                const features = content.features.filter((_, idx) => idx !== i);
                setContent({ ...content, features });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
