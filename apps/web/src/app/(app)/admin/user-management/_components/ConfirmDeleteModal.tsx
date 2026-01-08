"use client";

import Button from "@/components/ui/Button";

export default function ConfirmDeleteModal({
  open,
  username,
  onCancel,
  onDelete,
}: {
  open: boolean;
  username?: string;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (!open) return null;

  return (
    <div>
        <h3 className="text-lg font-bold mb-2">Delete Confirmation</h3>
        <p className="text-sm mb-8">
          Are you sure want to delete user <b>{username}</b>?
        </p>
        <div className="flex justify-end gap-2 mt-5 ml-50">
          <Button onClick={onCancel} variant="secondary" size="md" radius="xl">
            Cancel
          </Button>
          <Button onClick={onDelete} variant="danger" size="md" radius="xl">
            Delete
          </Button>
        </div>
    </div>
  );
}
