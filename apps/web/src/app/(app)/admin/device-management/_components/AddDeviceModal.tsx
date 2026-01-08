"use client";

import type { Dispatch, SetStateAction } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/common/ModalPortal";
import { DEFAULT_LOCATION, WATTAGE_OPTIONS, type WattageOpt } from "../constants";
import FormInput from "@/components/ui/FormInput"; 

type ConfirmMoveState = {
  lat: number;
  lng: number;
  type: "click" | "drag";
};

type AddDeviceModalProps = {
  open: boolean;
  newDevice: any;
  setNewDevice: Dispatch<SetStateAction<any>>;
  errors: Record<string, string | undefined>;
  wattageOpt: WattageOpt;
  setWattageOpt: Dispatch<SetStateAction<WattageOpt>>;
  isLoaded: boolean;
  geocodeAddress: () => void;
  setConfirmMove: (v: ConfirmMoveState | null) => void;
  onCancel: () => void;
  onSave: () => void;
};


export default function AddDeviceModal({
  open,
  newDevice,
  setNewDevice,
  errors,
  wattageOpt,
  setWattageOpt,
  isLoaded,
  geocodeAddress,
  setConfirmMove,
  onCancel,
  onSave,
}: AddDeviceModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onCancel}>
      <h2 className="text-lg font-bold mb-4 text-center">Add Device</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <FormInput
            label="Serial Number"
            type="text"
            variant="dashboard"
            size="md"
            placeholder="ETS-***"
            value={newDevice.serial_number}
            onChange={(e) =>
              setNewDevice((prev: any) => ({
                ...prev,
                serial_number: e.target.value,
              }))
            }
            error={errors.serial_number}
          />
        </div>

        <div>
          <FormInput
            label="Username"
            type="text"
            variant="dashboard"
            placeholder="Username Owner"
            size="md"
            value={newDevice.username}
            onChange={(e) =>
              setNewDevice((prev: any) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            error={errors.username}
          />
        </div>

        <div>
          <FormInput
            label="Address Name"
            type="text"
            variant="dashboard"
            size="md"
            placeholder="Street, Province, City/Regency, District, Sub-district, Postal Code"
            value={newDevice.address_name}
            onChange={(e) =>
              setNewDevice((prev: any) => ({
                ...prev,
                address_name: e.target.value,
              }))
            }
            error={errors.address_name}
          />
        </div>

        <div>
          <FormInput
            label="Detail Address Name"
            type="text"
            variant="dashboard"
            size="md"
            placeholder="e.g., 1st Floor, 2nd Floor"
            value={newDevice.detail_address_name}
            onChange={(e) =>
              setNewDevice((prev: any) => ({
                ...prev,
                detail_address_name: e.target.value,
              }))
            }
            error={errors.detail_address_name}
          />
        </div>

        <div>
          <FormInput
            label="Latitude"
            variant="dashboard"
            size="md"            
            placeholder="-6.2221431"
            type="number"
            step="any"
            value={Number.isNaN(newDevice.lat) ? "" : newDevice.lat}
            onChange={(e) => {
              const val = e.target.value;
              setNewDevice((prev: any) => ({
                ...prev,
                lat: val === "" ? Number.NaN : parseFloat(val),
              }));
            }}
            error={errors.lat}
          />
        </div>

        <div>
          <FormInput
            label="Longitude"
            variant="dashboard"
            size="md"  
            type="number"
            step="any"
            placeholder="106.9179941"
            value={Number.isNaN(newDevice.long) ? "" : newDevice.long}
            onChange={(e) => {
              const val = e.target.value;
              setNewDevice((prev: any) => ({
                ...prev,
                long: val === "" ? Number.NaN : parseFloat(val),
              }));
            }}
            error={errors.long}
          />
        </div>

        <div>
          <FormInput
            label="Segment"
            variant="dashboard"
            size="md"  
            placeholder="e.g.,Residential, Home, School"
            type="text"
            value={newDevice.segment}
            onChange={(e) =>
              setNewDevice((prev: any) => ({
                ...prev,
                segment: e.target.value,
              }))
            }
            error={errors.segment}
          />
        </div>

        <div>
            <FormInput
            label="Wattage"
            variant="dashboard"
            size="md"
            asChild
            >
            <div className="relative w-full h-full flex items-center">
                <select
                value={wattageOpt}
                onChange={(e) => setWattageOpt(e.target.value as WattageOpt)}
                className="
                    w-full bg-transparent text-white text-sm
                    outline-none
                "
                >
                {WATTAGE_OPTIONS.map((w) => (
                    <option key={w} value={w} className="bg-[#103879] text-white">
                    {w}
                    </option>
                ))}
                </select>
            </div>
            </FormInput>

            <p className="text-xs opacity-70 mt-1">
            Phase akan otomatis diset <b>1-Phase</b> oleh sistem.
            </p>
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
                  !Number.isNaN(newDevice.lat) &&
                  !Number.isNaN(newDevice.long)
                    ? 14
                    : 9
                }
                center={
                  !Number.isNaN(newDevice.lat) &&
                  !Number.isNaN(newDevice.long)
                    ? { lat: newDevice.lat, lng: newDevice.long }
                    : DEFAULT_LOCATION
                }
                onClick={(e) => {
                  if (!e.latLng) return;
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();

                  if (
                    Number.isNaN(newDevice.lat) ||
                    Number.isNaN(newDevice.long)
                  ) {
                    setNewDevice((prev: any) => ({
                      ...prev,
                      lat,
                      long: lng,
                    }));
                    return;
                  }

                  setConfirmMove({ lat, lng, type: "click" });
                }}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  mapTypeId: "roadmap",
                }}
              >
                {!Number.isNaN(newDevice.lat) &&
                  !Number.isNaN(newDevice.long) && (
                    <Marker
                      position={{
                        lat: newDevice.lat,
                        lng: newDevice.long,
                      }}
                      title="Device Location"
                      draggable
                      onDragEnd={(e) => {
                        const lat = e.latLng?.lat();
                        const lng = e.latLng?.lng();
                        if (!lat || !lng) return;

                        if (
                          Number.isNaN(newDevice.lat) ||
                          Number.isNaN(newDevice.long)
                        ) {
                          setNewDevice((prev: any) => ({
                            ...prev,
                            lat,
                            long: lng,
                          }));
                        } else {
                          setConfirmMove({ lat, lng, type: "drag" });
                        }
                      }}
                    />
                  )}
              </GoogleMap>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Click on the map to select a new location or drag the marker to
              move its position.
            </p>

            <div>
              <button
                type="button"
                onClick={geocodeAddress}
                className="mt-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-xs transition"
              >
                🔍 Find Location from Address
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-10 ml-50">
        <Button onClick={onCancel} variant="secondary" size="md">
          Cancel
        </Button>
        <Button onClick={onSave} variant="primary" size="md">
          Save
        </Button>
      </div>
    </Modal>
  );
}
