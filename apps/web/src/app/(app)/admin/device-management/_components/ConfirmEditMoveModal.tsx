"use client";

import Modal from "@/components/common/ModalPortal";
import Button from "@/components/ui/Button";

type ConfirmEditMoveState = {
  lat: number;
  lng: number;
  type: "click" | "drag";
};

export default function ConfirmEditMoveModal({
  confirmEditMove,
  onCancel,
  onConfirm,
}: {
  confirmEditMove: ConfirmEditMoveState | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirmEditMove) return null;

  return (
    <Modal open={true} onClose={onCancel}>
      <h3 className="text-lg font-bold mb-2 text-center">
        Confirm{" "}
        {confirmEditMove.type === "drag" ? "Marker Move" : "Map Click"}
      </h3>
      <p className="text-sm text-center mb-6">
        Do you want to update <b>device location</b> to:
        <br />
        <span className="text-yellow-300">
          Lat: {confirmEditMove.lat.toFixed(6)}, Lng:{" "}
          {confirmEditMove.lng.toFixed(6)}
        </span>
      </p>
      <div className="flex justify-center gap-3 mt-6">
        <Button
          label="Cancel"
          variant="secondary"
          size="md"
          radius="xl"
          onClick={onCancel}
          className="px-5 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
        >
        </Button>
        <Button
          label="Yes, Update"
          variant="primary"
          size="md"
          radius="xl"
          onClick={onConfirm}
          className="px-5 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
        >
        </Button>
      </div>
    </Modal>
  );
}
