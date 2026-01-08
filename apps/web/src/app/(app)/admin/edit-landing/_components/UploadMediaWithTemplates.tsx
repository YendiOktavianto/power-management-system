// apps/web/src/app/(app)/admin/edit-landing/_components/UploadMediaWithTemplates.tsx
"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import useToast from "@/components/common/hooks/useToastMessage"
import { API_BASE } from "../constants";
import { uploadImageToServer } from "../useEditLanding";

type ToastApi = ReturnType<typeof useToast>;

export type TemplateItem = {
  url: string;
  label: string;
  group?: string;
  type?: "image" | "video";
};

export type UploadMediaProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  fieldName?: string;
  maxMB?: number;
  showTemplates?: boolean;
  templates?: TemplateItem[];
  templateEndpoint?: string;
  templateGroups?: string[];
  notify?: ToastApi;
};

export default function UploadMediaWithTemplates({
  label,
  value,
  onChange,
  accept = "image/*,video/mp4",
  fieldName = "file",
  maxMB = 20,
  showTemplates = false,
  templates = [],
  templateEndpoint,
  templateGroups,
  notify,
}: UploadMediaProps) {
  const internalToast = useToast();
  const toast = notify ?? internalToast;

  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TemplateItem[]>(templates);
  const [loaded, setLoaded] = useState<boolean>(!!templates?.length);
  const [group, setGroup] = useState<string>("all");

  useEffect(() => {
    let done = false;
    (async () => {
      if (!showTemplates || !templateEndpoint || !open || loaded) return;
      try {
        const res = await fetch(templateEndpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const arr: TemplateItem[] = (data?.items ?? data ?? [])
          .map((d: any) => ({
            url: String(d.url ?? d.src ?? ""),
            label: String(d.label ?? d.name ?? d.title ?? "Template"),
            group: d.group ?? d.folder ?? "default",
            type: d.type ?? (/\.(mp4)(\?.*)?$/i.test(String(d.url ?? d.src)) ? "video" : "image"),
          }))
          .filter((x: TemplateItem) => x.url);
        if (!done) {
          setItems(arr);
          setLoaded(true);
        }
      } catch (e: any) {
        if (!done) {
          setLoaded(true);
          toast.error("Load templates failed", e?.message ?? "Unknown error");
        }
      }
    })();
    return () => {
      done = true;
    };
  }, [showTemplates, templateEndpoint, open, loaded, toast]);

  const groups = useMemo(() => {
    const g =
      templateGroups && templateGroups.length
        ? templateGroups
        : Array.from(new Set(items.map((i) => i.group ?? "default")));
    return ["all", ...g];
  }, [items, templateGroups]);

  async function handleFile(file: File) {
    setErr("");
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isMp4 = file.type === "video/mp4";
    if (!isImage && !isMp4) {
      const msg = "Files must be images or MP4.";
      setErr(msg);
      toast.error("Upload failed", msg);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      const msg = `Maximum size ${maxMB}MB.`;
      setErr(msg);
      toast.error("Upload failed", msg);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageToServer(file, fieldName);
      onChange(url);
      toast.success("Upload successful", "The file has been saved");
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Unknown error";
      setErr(
        msg.includes("404")
          ? `Upload endpoint not found (404). Check NEXT_PUBLIC_UPLOAD_PATH / route backend. Details: ${msg}`
          : `Upload failed: ${msg}`,
      );
      toast.error("Upload failed", msg);
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = (() => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return value;
    return `${API_BASE}/${value.replace(/^\/+/, "")}`;
  })();

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between">
        <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>
        {showTemplates && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[11px] mb-1 px-2 py-1 rounded-lg border border-white/10 text-[#7ec7ff] hover:bg-white/5"
            title="Browse Templates"
          >
            Browse Templates
          </button>
        )}
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`block rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition ${
          uploading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/90">
            {uploading ? "Uploading…" : value ? "Change media" : "Choose / drag-drop media here"}
          </div>
          <div className="text-xs text-white/60">PNG · JPG · WEBP · MP4</div>
        </div>
      </label>

      {value && (
        <div className="mt-3 flex items-start gap-3">
          {/\.(mp4)(\?.*)?$/i.test(value) ? (
            <video src={previewSrc} className="w-28 h-28 object-cover rounded-lg border border-white/10" controls />
          ) : (
            <img src={previewSrc} alt="preview" className="w-28 h-28 object-cover rounded-lg border border-white/10" />
          )}
        </div>
      )}

      {err && (
        <p className="mt-2 text-xs text-red-300 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
          {err}
        </p>
      )}

      {showTemplates && (
        <TemplateOverlay
          open={open}
          onClose={() => setOpen(false)}
          items={items}
          groups={groups}
          group={group}
          setGroup={setGroup}
          loaded={loaded}
          value={value}
          onPick={(u, label) => {
            onChange(u);
            toast.info("Template selected", label);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Template Overlay helper ---------- */
function TemplateOverlay({
  open,
  onClose,
  items,
  groups,
  group,
  setGroup,
  loaded,
  value,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  items: TemplateItem[];
  groups: string[];
  group: string;
  setGroup: (g: string) => void;
  loaded: boolean;
  value: string;
  onPick: (url: string, label: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const filtered = items.filter((i) => group === "all" || (i.group ?? "default") === group);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#071426]/90 text-white shadow-xl">
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="text-sm font-medium">Choose a Template</div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-4 pt-3">
            <div className="inline-flex rounded-xl border border-white/10 overflow-hidden text-xs">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  className={`px-3 py-1.5 ${group === g ? "bg-white/10" : "hover:bg-white/5"}`}
                  aria-pressed={group === g}
                >
                  {String(g).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 max-h-[60vh] overflow-auto [scrollbar-gutter:stable]">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((t) => {
                const isVideo = t.type === "video" || /\.(mp4)(\?.*)?$/i.test(t.url);
                const selected = value && value === t.url;
                return (
                  <button
                    key={t.url}
                    type="button"
                    onClick={() => onPick(t.url, t.label)}
                    className={`relative rounded-2xl overflow-hidden border transition ${
                      selected ? "border-sky-400 ring-2 ring-sky-400/40" : "border-white/10 hover:border-white/20"
                    }`}
                    title={`${t.group ?? "default"}/${t.label}`}
                  >
                    <div className="aspect-square bg-white/5">
                      {isVideo ? (
                        <div className="w-full h-full grid place-items-center text-[11px] text-white/70">
                          <span className="px-2 py-1 rounded bg-black/40 border border-white/10">Video</span>
                        </div>
                      ) : (
                        <img src={t.url} alt={t.label} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center text-white/80 bg-black/30 rounded-md px-1 truncate">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {loaded && filtered.length === 0 && (
              <div className="text-center text-white/70 text-sm py-8">No templates in “{group}”.</div>
            )}
            {!loaded && (
              <div className="text-center text-white/70 text-sm py-8">Loading templates…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
