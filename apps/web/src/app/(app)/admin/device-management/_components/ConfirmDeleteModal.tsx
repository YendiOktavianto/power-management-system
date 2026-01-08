"use client";

import Modal from "@/components/common/ModalPortal";
import type { DataRow } from "../types";
import Button from "@/components/ui/Button";

type Props = {
  item: DataRow | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  item,
  onCancel,
  onConfirm,
}: Props) {
  if (!item) return null;

  return (
    <Modal
      open={true}
    >
      <h3 className="text-lg font-bold mb-2">Delete Confirmation</h3>
      <p className="text-sm mb-8">
        Are you sure want to delete{" "}
        <b>{item.serial_number}</b> device with owner{" "}
        <b>{item.username}</b>?
      </p>
      <div className="flex justify-end gap-2 ml-50">
        <Button
          label = "Cancel"
          variant="secondary"
          size="md"
          radius="xl"
          onClick={onCancel}
          className="px-3 py-1 rounded-full bg-gray-500 hover:bg-gray-600"
        >          
        </Button>
        <Button
          label = "Delete"
          variant="danger"
          size="md"
          radius="xl"
          onClick={onConfirm}
        >          
        </Button>
      </div>
    </Modal>
  );
}
