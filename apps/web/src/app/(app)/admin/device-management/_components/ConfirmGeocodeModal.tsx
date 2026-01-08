"use client";

import Modal from "@/components/common/ModalPortal";
import Button from "@/components/ui/Button";

type ConfirmGeocodeState = {
  lat: number;
  lng: number;
};

export default function ConfirmGeocodeModal({
  confirmGeocode,
  onCancel,
  onConfirm,
}: {
  confirmGeocode: ConfirmGeocodeState | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirmGeocode) return null;

  return (
    <Modal open={true} onClose={onCancel}>
      <h3 className="text-lg font-bold mb-2 text-center">Confirm Geocoded Location</h3>
      <p className="text-sm mb-6">
        <br />
        System found this location for the entered address:
        <br />
        <span className="text-yellow-300">
          Lat: {confirmGeocode.lat.toFixed(6)}, Lng:{" "}
          {confirmGeocode.lng.toFixed(6)}
        </span>
        <br /> <br />
        Do you want to replace your current coordinates with this location?
      </p>
      <div className="flex justify-center gap-3">
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
