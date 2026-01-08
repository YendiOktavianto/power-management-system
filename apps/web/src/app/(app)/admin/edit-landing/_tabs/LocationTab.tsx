// apps/web/src/app/(app)/admin/edit-landing/_tabs/LocationTab.tsx
"use client";

import type { Content } from "../types";
import { InputField } from "../_components/FormFields";
import { allowlistedEmbed, toMapsEmbedFromUrl } from "../validation";
import type useToast from "@/components/common/hooks/useToastMessage";

export default function LocationTab({
  content,
  setContent,
  toastApi,
}: {
  content: Content;
  setContent: (c: Content) => void;
  toastApi: ReturnType<typeof useToast>;
}) {
  async function handleGenerateEmbed() {
    let { mapsUrl, address } = content.location;
    let embed = toMapsEmbedFromUrl(mapsUrl || "");

    if (!embed && /maps\.app\.goo\.gl/i.test(mapsUrl || "")) {
      try {
        const res = await fetch(`/api/resolve-map?url=${encodeURIComponent(mapsUrl!)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        const finalUrl = json?.ok ? String(json.finalUrl) : "";
        if (finalUrl) {
          const nextEmbed = toMapsEmbedFromUrl(finalUrl);
          setContent({
            ...content,
            location: { ...content.location, mapsUrl: finalUrl },
          });
          embed = nextEmbed;
        }
      } catch {
        // biarkan, error di-handle toast di bawah
      }
    }

    if (!embed && address) {
      embed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    }

    if (embed) {
      setContent({
        ...content,
        location: { ...content.location, iframeSrc: embed },
      });
      toastApi.success(
        "Embed created",
        /output=embed/.test(embed) ? "From URL/Address" : "From Maps Embed",
      );
    } else {
      toastApi.error(
        "Cannot generate",
        "Paste the long Google Maps URL (not maps.app.goo.gl) or fill in the Address, then try again.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-3 bg-white/5">
        <h4 className="text-sm font-medium text-[#7ec7ff] mb-3">
          Section Heading
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InputField
            label="Location Title"
            value={content.locationSection.title}
            onChange={(v) =>
              setContent({
                ...content,
                locationSection: {
                  ...content.locationSection,
                  title: v,
                },
              })
            }
          />
          <InputField
            label="Location Subtitle"
            value={content.locationSection.subtitle}
            onChange={(v) =>
              setContent({
                ...content,
                locationSection: {
                  ...content.locationSection,
                  subtitle: v,
                },
              })
            }
          />
          <InputField
            label="HQ Title"
            value={content.locationSection.hqTitle}
            onChange={(v) =>
              setContent({
                ...content,
                locationSection: {
                  ...content.locationSection,
                  hqTitle: v,
                },
              })
            }
          />
        </div>
      </div>

      <InputField
        label="Address"
        value={content.location.address}
        onChange={(v) =>
          setContent({
            ...content,
            location: { ...content.location, address: v },
          })
        }
      />
      <InputField
        label="Hours"
        value={content.location.hours}
        onChange={(v) =>
          setContent({
            ...content,
            location: { ...content.location, hours: v },
          })
        }
      />
      <InputField
        label="Phone"
        value={content.location.phone}
        onChange={(v) =>
          setContent({
            ...content,
            location: { ...content.location, phone: v },
          })
        }
      />
      <InputField
        label="Google Maps URL"
        value={content.location.mapsUrl}
        onChange={(v) =>
          setContent({
            ...content,
            location: { ...content.location, mapsUrl: v },
          })
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
        <InputField
          label="Iframe Embed (src)"
          value={content.location.iframeSrc}
          onChange={(v) =>
            setContent({
              ...content,
              location: { ...content.location, iframeSrc: v },
            })
          }
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
        <button
          type="button"
          className="h-10 px-3 rounded-xl border border-[#1d9bf0]/40 text-[#7ec7ff] hover:bg-[#072b56]/40 text-sm"
          onClick={handleGenerateEmbed}
        >
          Generate from Maps URL
        </button>
      </div>

      {allowlistedEmbed(content.location.iframeSrc) ? (
        <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/20">
          <iframe
            src={allowlistedEmbed(content.location.iframeSrc)}
            width="100%"
            height="280"
            loading="lazy"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : content.location.iframeSrc ? (
        <p className="mt-2 text-xs text-amber-200 bg-amber-900/30 border border-amber-700/30 rounded-lg p-2">
          Iframe src did not pass the whitelist (only Google Maps embeds are allowed).
        </p>
      ) : null}
    </div>
  );
}
