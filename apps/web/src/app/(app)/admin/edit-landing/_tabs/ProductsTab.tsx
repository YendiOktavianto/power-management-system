// apps/web/src/app/(app)/admin/edit-landing/_tabs/ProductsTab.tsx
"use client";

import type { Content } from "../types";
import { InputField, TextareaField } from "../_components/FormFields";
import UploadMediaWithTemplates from "../_components/UploadMediaWithTemplates";
import type useToast from "@/components/common/hooks/useToastMessage";

export default function ProductsTab({
  content,
  setContent,
  toastApi,
}: {
  content: Content;
  setContent: (c: Content) => void;
  toastApi: ReturnType<typeof useToast>;
}) {
  function setTile(idx: 0 | 1, patch: Partial<{ value: string; text: string }>) {
    const tiles = [...(content.products.tiles || [])];
    if (!tiles[0]) tiles[0] = { value: "", text: "" };
    if (!tiles[1]) tiles[1] = { value: "", text: "" };
    tiles[idx] = { ...tiles[idx], ...patch };
    setContent({ ...content, products: { ...content.products, tiles } });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 p-3 bg-white/5">
          <h4 className="text-sm font-medium text-[#7ec7ff] mb-3">
            Section Heading
          </h4>
          <InputField
            label="Section Title"
            value={content.products.title}
            onChange={(v) =>
              setContent({
                ...content,
                products: { ...content.products, title: v },
              })
            }
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-[#7ec7ff]">Tiles</h4>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:[grid-template-columns:140px_minmax(0,1fr)] gap-3 items-center">
            <InputField
              label="Value"
              value={content.products.tiles?.[0]?.value ?? ""}
              onChange={(v) => setTile(0, { value: v })}
            />
            <InputField
              label="Text"
              value={content.products.tiles?.[0]?.text ?? ""}
              onChange={(v) => setTile(0, { text: v })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 items-center">
            <InputField
              label="Text"
              value={content.products.tiles?.[1]?.text ?? ""}
              onChange={(v) => setTile(1, { text: v })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Stable Title"
          value={content.products.stable.title}
          onChange={(v) =>
            setContent({
              ...content,
              products: {
                ...content.products,
                stable: { ...content.products.stable, title: v },
              },
            })
          }
        />
        <UploadMediaWithTemplates
          label="Stable Image"
          value={content.products.stable.imageSrc}
          onChange={(url) =>
            setContent({
              ...content,
              products: {
                ...content.products,
                stable: {
                  ...content.products.stable,
                  imageSrc: url,
                },
              },
            })
          }
          showTemplates={false}
          notify={toastApi}
        />
      </div>
      <TextareaField
        label="Stable Body"
        value={content.products.stable.body}
        onChange={(v) =>
          setContent({
            ...content,
            products: {
              ...content.products,
              stable: { ...content.products.stable, body: v },
            },
          })
        }
      />
    </div>
  );
}
