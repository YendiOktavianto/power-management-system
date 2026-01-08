"use client";

import React from "react";
import DevicePickerTrigger from "@/components/features/device-picker/DevicePickerTrigger";
import { Label } from "@/components/ui/TextBits";
import PageHeader from "@/components/ui/PageHeader";

type DeviceLike = {
  device_id?: string;
  watt_phase?: string | null;
  wattagePhase?: string | null;
  segment?: string;
  address_name?: string;
  [key: string]: any;
};

type Props<T extends DeviceLike = DeviceLike> = {
  title: string;
  headRef?: React.Ref<HTMLElement>;

  devicesView: T[];
  selectedId?: string;
  setSelected: (id: string) => void;
  current?: Partial<T>;

  onOpenPicker: () => void;
  pickBtnRef?:
    | React.MutableRefObject<HTMLButtonElement | null>
    | ((el: HTMLButtonElement | null) => void);
  forceOverlay?: boolean;
};

export default function DeviceInfoHeaderSimple<
  T extends DeviceLike = DeviceLike,
>({
  title,
  headRef,
  devicesView,
  selectedId,
  setSelected,
  current,
  onOpenPicker,
  pickBtnRef,
}: Props<T>) {
  // --- SERIAL NUMBER ---
  const serialLabel =
    (current?.device_id && current.device_id.trim() !== ""
      ? current.device_id
      : (current as any)?.serial_number ??
        (current as any)?.serialNumber ??
        (current as any)?.serialnumber) || "-";

  // --- WATTAGE / PHASE ---
  const wattageLabel =
    current?.watt_phase ??
    (current as any)?.wattagePhase ??
    (current as any)?.wattagephase ??
    "-";

  // --- LOCATION (untuk text di input picker) ---
  const locationLabel =
    (current?.address_name && current.address_name.trim() !== ""
      ? current.address_name
      : ((current as any)?.location as string) || "") || "";

  // current yang dikirim ke DevicePickerTrigger kita “patch”
  // supaya address_name selalu terisi locationLabel
  const currentForPicker = {
    ...(current as T),
    address_name: locationLabel,
  } as T;

  return (
    <header ref={headRef} className="text-white">
      <PageHeader title={title} />

      <section className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-white mb-4 sm:mb-5 text-[11px] sm:text-[10px]">
        {/* KIRI: Serial number + Location */}
        <div className="min-w-0">
          {/* Serial Number */}
          <Label>Serial Number</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[12px] tracking-wide">
              {serialLabel}
            </span>
          </p>

          {/* Location (via picker overlay) */}
          <Label className="mt-2">Location</Label>
          <DevicePickerTrigger
            devicesView={devicesView}
            selectedId={selectedId ?? ""}
            setSelected={setSelected}
            current={currentForPicker}
            onOpen={onOpenPicker}
            pickBtnRef={pickBtnRef}
            forceOverlay={true}
          />
        </div>

        {/* KANAN: Watt / Segment */}
        <div className="text-left sm:text-right">
          <Label>Wattage / Phase</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[12px] tracking-wide">
              {wattageLabel}
            </span>
          </p>

          <Label className="mt-1.5">Segment</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[12px] tracking-wide">
              {current?.segment || "-"}
            </span>
          </p>
        </div>
      </section>
    </header>
  );
}
