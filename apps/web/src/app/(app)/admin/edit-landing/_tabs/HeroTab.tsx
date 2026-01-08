// apps/web/src/app/(app)/admin/edit-landing/_tabs/HeroTab.tsx
"use client";

import type { Content } from "../types";
import { InputField, TextareaField } from "../_components/FormFields";

export default function HeroTab({
  content,
  setContent,
}: {
  content: Content;
  setContent: (c: Content) => void;
}) {
  return (
    <div className="space-y-4">
      <InputField
        label="Heading"
        value={content.hero.heading}
        onChange={(v) =>
          setContent({ ...content, hero: { ...content.hero, heading: v } })
        }
      />
      <TextareaField
        label="Subheading"
        value={content.hero.subheading}
        onChange={(v) =>
          setContent({
            ...content,
            hero: { ...content.hero, subheading: v },
          })
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Button Primary Label"
          value={content.hero.primaryCta.label}
          onChange={(v) =>
            setContent({
              ...content,
              hero: {
                ...content.hero,
                primaryCta: { ...content.hero.primaryCta, label: v },
              },
            })
          }
        />
        <InputField
          label="Button Secondary Label"
          value={content.hero.secondaryCta.label}
          onChange={(v) =>
            setContent({
              ...content,
              hero: {
                ...content.hero,
                secondaryCta: { ...content.hero.secondaryCta, label: v },
              },
            })
          }
        />
      </div>
    </div>
  );
}
