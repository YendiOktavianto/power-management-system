"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import Modal from "@/components/common/ModalPortal";
import { DEFAULT_LOCATION } from "../constants";
import type { DataRow } from "../types";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";

type ErrorMap = Partial<Record<keyof DataRow, string>>;

type ConfirmEditMove = {
  lat: number;
  lng: number;
  type: "click" | "drag";
};

type Props = {
  row: DataRow | null;
  errors: ErrorMap;
  isLoaded: boolean;
  onChangeRow: (updater: (prev: DataRow) => DataRow) => void;
  onClose: () => void;
  onSave: () => void;
  setConfirmEditMove: (v: ConfirmEditMove | null) => void;
};

export default function EditDeviceModal({
  row,
  errors,
  isLoaded,
  onChangeRow,
  onClose,
  onSave,
  setConfirmEditMove,
}: Props) {
  if (!row) return null;

  const handleChange = (patch: Partial<DataRow>) => {
    onChangeRow((prev) => ({ ...prev, ...patch }));
  };

  return (
    <Modal open={true}>
      <h2 className="text-lg font-bold mb-4 text-center">Edit Device</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <FormInput
            label="Address Name"
            type="text"
            variant="dashboard"
            size="md"
            value={row.address_name}
            onChange={(e) => handleChange({ address_name: e.target.value })}
            error={errors.address_name}
          />
        </div>

        <div>
          <FormInput
            label="Detail Address Name"
            type="text"
            variant="dashboard"
            size="md"
            value={row.detail_address_name}
            onChange={(e) =>
              handleChange({ detail_address_name: e.target.value })
            }
            error={errors.detail_address_name}
          />
        </div>

        <div>
          <FormInput
            label="Latitude"
            type="number"
            variant="dashboard"
            size="md"
            step="any"
            value={row.lat}
            onChange={(e) =>
              handleChange({ lat: parseFloat(e.target.value) })
            }
            error={errors.lat}
          />
        </div>

        <div>
          <FormInput
            label="Longitude"
            type="number"
            variant="dashboard"
            size="md"
            step="any"
            value={row.long}
            onChange={(e) =>
              handleChange({ long: parseFloat(e.target.value) })
            }
            error={errors.long}
          />
        </div>

        <div>
          <FormInput
            label="Segment"
            type="text"
            variant="dashboard"
            size="md"
            value={row.segment}
            onChange={(e) => handleChange({ segment: e.target.value })}
            error={errors.segment}
          />
        </div>

        {isLoaded && (
          <div className="mt-4">
            <label className="block mb-1 text-sm font-semibold">
              Map Preview
            </label>
            <div className="w-full h-60 rounded-lg overflow-hidden border border-gray-500">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={
                  !Number.isNaN(row.lat) && !Number.isNaN(row.long) ? 14 : 9
                }
                center={
                  !Number.isNaN(row.lat) && !Number.isNaN(row.long)
                    ? { lat: row.lat, lng: row.long }
                    : DEFAULT_LOCATION
                }
                onClick={(e) => {
                  if (!e.latLng) return;
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();

                  if (Number.isNaN(row.lat) || Number.isNaN(row.long)) {
                    onChangeRow((prev) => ({
                      ...prev,
                      lat,
                      long: lng,
                    }));
                    return;
                  }

                  setConfirmEditMove({ lat, lng, type: "click" });
                }}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  fullscreenControl: true,
                  gestureHandling: "greedy",
                  streetViewControl: false,
                  mapTypeId: "roadmap",
                }}
              >
                {!Number.isNaN(row.lat) && !Number.isNaN(row.long) && (
                  <Marker
                    position={{
                      lat: row.lat,
                      lng: row.long,
                    }}
                    title="Device Location"
                    draggable
                    onDragEnd={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (!lat || !lng) return;

                      setConfirmEditMove({
                        lat,
                        lng,
                        type: "drag",
                      });
                    }}
                  />
                )}
              </GoogleMap>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Click or drag marker to update device location visually.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-10 ml-50">
        <Button
          label = "Cancel"
          variant="secondary"
          size="md"
          onClick={onClose}
          className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition"
        >
          
        </Button>
        <Button
          label = "Save"
          variant="primary"
          size="md"
          onClick={onSave}
          className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition"
        >          
        </Button>
      </div>
    </Modal>
  );
}
