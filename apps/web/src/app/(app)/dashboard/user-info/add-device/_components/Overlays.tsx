"use client";

import React from "react";
import SubmitButton from "@/components/ui/Button";
import { panding } from "@/components/ui/theme";

/* ---------------- Delete Confirm ---------------- */

export function DeleteConfirmOverlay({
  open,
  onCancel,
  onDelete,
  targetInfo,
}: {
  open: boolean;
  onCancel: () => void;
  onDelete: () => void;
  targetInfo: string;
}) {
  if (!open) return null;

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-white text-lg font-bold mb-2 text-center">
        Delete Request
      </h3>

      <p className="text-gray-300 text-sm">
        Are you sure you want to delete this request?
        <br />
        <span
          className={`block mt-2 text-xs px-2 py-1 rounded bg-white/5 ${panding}`}
          style={{ whiteSpace: "pre-line" }}
        >
          {targetInfo}
        </span>
      </p>

      <div className="flex justify-end gap-2 pt-4">
        <SubmitButton
          label="Cancel"
          onClick={onCancel}
          variant="secondary"
          radius="xl"
          size="sm"
        />
        <SubmitButton
          label="Delete"
          onClick={onDelete}
          variant="danger"
          radius="xl"
          size="sm"
        />
      </div>
    </div>
  );
}

/* ---------------- Warning (marker belum digeser) ---------------- */

export function WarningOverlay({
  open,
  onOK,
}: {
  open: boolean;
  onOK: () => void;
}) {
  if (!open) return null;

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-white text-lg font-bold mb-2 text-center">
        Marker Required
      </h3>

      <p className="text-gray-300 text-sm">
        You must adjust the map marker before you can submit the request.
      </p>

      <div className="pt-4 flex justify-center">
        <SubmitButton
          label="OK, I’ll set the marker"
          onClick={onOK}
          size="md"
          variant="primary"
          radius="lg"
        />
      </div>
    </div>
  );
}

/* ---------------- Final Confirm (lat/lng) ---------------- */

export function ConfirmOverlay({
  open,
  onCancel,
  onConfirm,
  lat,
  lng,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  lat: number;
  lng: number;
}) {
  if (!open) return null;

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-white text-lg font-bold mb-2 text-center">
        Final Confirmation
      </h3>

      <p className="text-gray-300 text-sm">
        Location chosen:
        <br />
        <span
          className={`inline-block mt-2 font-bold px-2 py-1 rounded bg-white/5 ${panding}`}
        >
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
        <br />
        <br />
        Is this correct?
        <br />
        Once submitted, only administrators can make changes.
      </p>

      <div className="flex gap-2 pt-4 justify-center">
        <SubmitButton
          label="Check Again"
          onClick={onCancel}
          size="md"
          variant="secondary"
          radius="lg"
        />
        <SubmitButton
          label="Confirm & Submit"
          onClick={onConfirm}
          size="md"
          variant="primary"
          radius="lg"
        />
      </div>
    </div>
  );
}
