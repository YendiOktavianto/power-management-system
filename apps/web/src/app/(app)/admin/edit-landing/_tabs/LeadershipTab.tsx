// apps/web/src/app/(app)/admin/edit-landing/_tabs/LeadershipTab.tsx
"use client";

import type { Content } from "../types";
import { InputField } from "../_components/FormFields";
import ArrayPeopleEditor from "../_components/ArrayPeopleEditor";

export default function LeadershipTab({
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
          Section Heading
        </h4>
        <InputField
          label="Leadership Title"
          value={content.leadershipSection.title}
          onChange={(v) =>
            setContent({
              ...content,
              leadershipSection: {
                ...content.leadershipSection,
                title: v,
              },
            })
          }
        />
      </div>

      <ArrayPeopleEditor
        title="Leadership Team"
        items={content.leadership}
        onChange={(items) =>
          setContent({
            ...content,
            leadership: items as Content["leadership"],
          })
        }
        showTemplates
        templateEndpoint="/api/avatar-templates"
        templateGroups={["profile", "profile2"]}
      />
    </div>
  );
}
