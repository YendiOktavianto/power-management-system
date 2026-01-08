// apps/web/src/app/(app)/admin/edit-landing/_tabs/ContactsTab.tsx
"use client";

import type { Content } from "../types";
import { InputField } from "../_components/FormFields";
import ArrayPeopleEditor from "../_components/ArrayPeopleEditor";

export default function ContactsTab({
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            label="Contacts Title"
            value={content.contactsSection.title}
            onChange={(v) =>
              setContent({
                ...content,
                contactsSection: {
                  ...content.contactsSection,
                  title: v,
                },
              })
            }
          />
          <InputField
            label="Contacts Subtitle"
            value={content.contactsSection.subtitle}
            onChange={(v) =>
              setContent({
                ...content,
                contactsSection: {
                  ...content.contactsSection,
                  subtitle: v,
                },
              })
            }
          />
        </div>
      </div>

      <ArrayPeopleEditor
        title="Contacts / WhatsApp"
        items={content.contacts as any}
        phoneField
        onChange={(items) =>
          setContent({
            ...content,
            contacts: items as Content["contacts"],
          })
        }
        showTemplates
        templateEndpoint="/api/avatar-templates"
        templateGroups={["profile", "profile2"]}
      />
    </div>
  );
}
