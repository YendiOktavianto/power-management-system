"use client";

import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Dispatch, SetStateAction } from "react";
import type { Point, Area, Template, ToastKind } from "../types";

export default function AvatarEditor(
  {
  avatarTab,
  setAvatarTab,
  groupFilter,
  setGroupFilter,
  filteredTemplates,
  infoAvatar,
  fileUrl,
  setFileUrl,
  form,
  setForm,
  crop,
  setCrop,
  zoom,
  setZoom,
  setCroppedAreaPixels,
  pushToast,
}: {
  avatarTab: "upload" | "template";
  setAvatarTab: Dispatch<SetStateAction<"upload" | "template">>;
  groupFilter: "all" | "profile" | "profile2";
  setGroupFilter: Dispatch<SetStateAction<"all" | "profile" | "profile2">>;
  filteredTemplates: Template[];
  infoAvatar: string;
  fileUrl: string | null;
  setFileUrl: (v: string | null) => void;
  form: any;
  setForm: (v: any) => void;
  crop: Point;
  setCrop: (p: Point) => void;
  zoom: number;
  setZoom: (n: number) => void;
  setCroppedAreaPixels: (a: Area) => void;
  pushToast?: (type: ToastKind, text: string) => void;
}) {
  return (
    <div className="space-y-4 mt-2">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setAvatarTab("upload")}
          className={`py-2 rounded-xl border text-sm ${
            avatarTab === "upload" ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 hover:bg-white/5"
          }`}
        >
          Upload & Crop
        </button>
        <button
          onClick={() => {
            setAvatarTab("template");
            if (fileUrl) URL.revokeObjectURL(fileUrl);
            setFileUrl(null);
            setForm({ ...form, file: null });
          }}
          className={`py-2 rounded-xl border text-sm ${
            avatarTab === "template" ? "bg-white/10 border-white/50" : "bg-transparent border-white/10 hover:bg-white/5"
          }`}
        >
          Choose Template
        </button>
      </div>

      {/* Panel: Upload */}
      {avatarTab === "upload" && (
        <div className="flex flex-col items-center space-y-4 mt-4 mb-2">
          {fileUrl ? (
            <>
              <div className="relative w-[250px] h-[250px] bg-black rounded-xl overflow-hidden">
                <Cropper
                  image={fileUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedAreaPixels(area as Area)}
                />
              </div>

              {/* Slider zoom */}
              <div className="w-full flex flex-col items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-[250px]"
                  aria-label="Zoom"
                />
                <span className="text-[11px] text-white/60">Zoom: {zoom.toFixed(2)}x</span>
              </div>
            </>
          ) : (
            <Image
              src={infoAvatar}
              alt="Preview"
              width={120}
              height={120}
              className="rounded-full object-cover border border-white/10 shadow-lg"
            />
          )}

          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-md text-sm shadow-md focus:ring-2 focus:ring-sky-400/40">
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (!f) return;
                  const okType = /^image\/(png|jpe?g|webp)$/i.test(f.type);
                  const okSize = f.size <= 5 * 1024 * 1024; // 5MB
                  if (!okType) {
                    pushToast?.("error","Only PNG/JPG/WebP are supported for cropping");
                    return;
                  }
                  if (!okSize) {
                    pushToast?.("error","Max file size is 5MB");
                    return;
                  }
                  setForm({ ...form, file: f, templateUrl: null });
                  if (fileUrl) URL.revokeObjectURL(fileUrl);
                  setFileUrl(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
          <p className="text-white/60 text-xs text-center">Supported: JPG, PNG, WebP. Max 5MB.</p>
        </div>
      )}

      {/* Panel: Template */}
      {avatarTab === "template" && (
        <div className="mt-2">
          {/* Filter folder */}
          <div className="inline-flex rounded-xl border border-white/10 overflow-hidden text-xs">
            {(["all", "profile", "profile2"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3 py-1.5 ${groupFilter === g ? "bg-white/10" : "hover:bg-white/5"}`}
                aria-pressed={groupFilter === g}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Grid templates */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[240px] overflow-auto pr-1 mt-3 custom-scroll">
            {filteredTemplates.map((t) => {
              const selected = (form as any).templateUrl === t.url;
              return (
                <button
                  key={t.url}
                  type="button"
                  onClick={() => {
                    setForm((s: any) => ({ ...s, templateUrl: t.url, file: null }));
                    if (fileUrl) {
                      URL.revokeObjectURL(fileUrl);
                      setFileUrl(null);
                    }
                  }}
                  className={`relative rounded-2xl overflow-hidden border transition ${
                    selected ? "border-sky-400 ring-2 ring-sky-400/40" : "border-white/10 hover:border-white/20"
                  }`}
                  aria-pressed={selected}
                  title={`${t.group}/${t.label}`}
                >
                  <div className="aspect-square bg-white/5">
                    <Image src={t.url} alt={t.label} width={320} height={320} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center text-white/70 bg-black/30 rounded-md px-1 truncate">
                    {t.label}
                  </span>
                </button>
              );
            })}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center text-white/60 text-sm py-8">No templates found in “{groupFilter}”.</div>
            )}
          </div>

          {/* Preview pilihan */}
          {(form as any).templateUrl && (
            <div className="mt-4 flex items-center gap-3">
              <Image
                src={(form as any).templateUrl}
                alt="Selected template"
                width={80}
                height={80}
                className="rounded-full border border-white/10"
              />
              <button
                type="button"
                onClick={() => setForm((s: any) => ({ ...s, templateUrl: null }))}
                className="px-3 py-1.5 text-xs rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Remove selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
