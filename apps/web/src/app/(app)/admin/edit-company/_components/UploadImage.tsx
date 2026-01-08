"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Notifier } from "../useEditCompany";
import { uploadImageToServer } from "../useEditCompany";

export default function UploadImage({
  label,
  value,
  onChange,
  accept = "image/*",
  fieldName = "file",
  maxMB = 5,
  notify,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  fieldName?: string;
  maxMB?: number;
  notify?: Notifier;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function handleFile(file: File) {
    setErr("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const msg = "The file must be an image.";
      setErr(msg);
      notify?.error?.("Upload failed", msg);
      return;
    }

    if (file.size > maxMB * 1024 * 1024) {
      const msg = `Maximum image size ${maxMB}MB.`;
      setErr(msg);
      notify?.error?.("Upload failed", msg);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToServer(file, fieldName);
      onChange(url);
      notify?.success?.("Upload successful", "The image has been saved");
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : "Unknown error";
      const pretty = msg.includes("404")
        ? `Upload endpoint not found (404). Check NEXT_PUBLIC_UPLOAD_PATH / backend prefix. Details: ${msg}`
        : `Upload failed: ${msg}`;
      setErr(pretty);
      notify?.error?.("Upload failed", msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="text-xs mb-1 text-[#cfe9ff]">{label}</div>

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
            {uploading
              ? "Uploading…"
              : value
              ? "Change image"
              : "Select / drag & drop image here"}
          </div>
          <div className="text-xs text-white/60">PNG · JPG · WEBP</div>
        </div>
      </label>

      {value && (
        <div className="mt-3 flex items-start gap-3">
          <img
            src={value}
            alt="preview"
            className="w-32 h-24 object-cover rounded-lg border border-white/10"
          />
        </div>
      )}

      <div className="mt-3">
        <input
          className="w-full min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
          placeholder="or paste the image URL here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {err && (
        <p className="mt-2 text-xs text-red-300 bg-red-900/30 border border-red-700/30 rounded-lg p-2">
          {err}
        </p>
      )}
    </div>
  );
}
