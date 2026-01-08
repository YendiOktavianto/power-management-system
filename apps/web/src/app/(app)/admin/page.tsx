// apps/web/src/app/(app)/dashboard/page.tsx
"use client";

import React from "react";
import { useHome } from "./useDashboard";
import { formatCurrency } from "./validation";
import {
  VALUE_COLOR,
  ENERGY_COLOR,
  INFO_CARD_BG,
  CARD_BG,
} from "@/components/ui/theme";
import type { Device } from "./types";
import DevicePickerOverlay from "@/components/features/device-picker/DevicePickerOverlay";
import Card, { CardTitle } from "@/components/ui/Card";
import { LabeledValue } from "@/components/ui/TextBits";
import { ValueDisplay, CurrencyValue } from "@/components/ui/ValueDisplay";
import Header from "@/components/features/device-picker/DeviceInfoHeaderSimple";
import AppPageShell from "@/components/ui/AppPageShell";

// ID internal untuk merge snapshot ↔ list
function getRowId(d: any): string {
  return String(
    d.deviceId ??
      d.id ??
      (d as any).deviceid ??
      d.device_id ??
      ""
  );
}

export default function Dashboard() {
  const {
    devices = [],
    selectedDeviceId,
    setSelectedDeviceId,
    currentDevice,
    loading,
    error,
  } = useHome();

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hi, setHi] = React.useState(0);
  const pickBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // gabungkan currentDevice (yang sudah punya wattage dari snapshot) ke list
  const devicesView: Device[] = React.useMemo(() => {
    const list = Array.isArray(devices) ? (devices as Device[]) : [];
    if (!currentDevice) return list;

    const currentId = getRowId(currentDevice as any);
    if (!currentId) return list;

    return list.map((d) => {
      const id = getRowId(d as any);
      if (id !== currentId) return d;

      // merge wattage/phase + serial dari snapshot
      const snap: any = currentDevice;

      const mergedWattagePhase =
        snap.wattagePhase ??
        snap.wattagephase ??
        snap.watt_phase ??
        snap.wattage_phase ??
        snap.wattage ??
        (d as any).wattagePhase ??
        (d as any).wattagephase ??
        (d as any).watt_phase ??
        (d as any).wattage_phase ??
        (d as any).wattage ??
        undefined;

      return {
        ...d,
        watt_phase:
          snap.watt_phase ??
          snap.wattagePhase ??
          snap.wattagephase ??
          (d as any).watt_phase ??
          (d as any).wattagePhase ??
          (d as any).wattagephase ??
          undefined,
        wattagePhase: mergedWattagePhase,
        serial_number:
          snap.serial_number ??
          snap.serialNumber ??
          (d as any).serial_number ??
          (d as any).serialNumber ??
          undefined,
      } as Device;
    });
  }, [devices, currentDevice]);

  function cleanWattPhase(raw: any): string {
    const s = String(raw ?? "").trim();
    if (!s) return "";

    // gabung "PHASE-Phase", "Phase-phase", "phase Phase", dll → "Phase"
    const collapsed = s.replace(
      /\b(phase|Phase|PHASE)[- ]+(phase|Phase|PHASE)\b/g,
      "Phase"
    );

    return collapsed;
  }

  const selectedId = selectedDeviceId ?? "";

  const current: Partial<Device> =
      (currentDevice as Partial<Device>) ||
      devicesView.find((d) => getRowId(d) === selectedId) ||
      devicesView[0] ||
      {};

    // versi current khusus untuk Header (watt/phase sudah dibersihkan)
    const headerCurrent = React.useMemo(() => {
      const base: any = current || {};
      const rawPhase =
        base.wattagePhase ??
        base.wattagephase ??
        base.watt_phase ??
        base.wattage_phase ??
        base.wattage ??
        "";
      const cleaned = cleanWattPhase(rawPhase);

      return {
        ...base,
        wattagePhase: cleaned || base.wattagePhase,
        watt_phase: cleaned || base.watt_phase,
      };
    }, [current]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return devicesView;
    const q = query.toLowerCase();
    return devicesView.filter((d) => {
      const serial = d.device_id?.toLowerCase?.() ?? "";
      const addr = d.address_name?.toLowerCase?.() ?? "";
      const detail = d.detail_location?.toLowerCase?.() ?? "";
      return serial.includes(q) || addr.includes(q) || detail.includes(q);
    });
  }, [query, devicesView]);

  const closePicker = React.useCallback(() => {
    setPickerOpen(false);
    setTimeout(() => pickBtnRef.current?.focus(), 0);
  }, []);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pickerOpen]);

  React.useEffect(() => setHi(0), [query, filtered.length]);

  return (
    <AppPageShell>
      {/* background blur */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-blue-400/40" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-indigo-400/40" />
      </div>

      <Header
        title="Dashboard Monitoring"
        devicesView={devicesView as any}
        selectedId={selectedId}
        setSelected={(id) => setSelectedDeviceId(id)}
        current={headerCurrent as any}
        onOpenPicker={() => setPickerOpen(true)}
        pickBtnRef={pickBtnRef}
      />

      {/* Konten Card */}
      <div className="min-h-0 h-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-white">
        {/* Kolom 1 */}
        <div className="min-h-0 h-full grid grid-rows-2 gap-4 sm:gap-5">
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Voltage (Volt)</CardTitle>
            <ValueDisplay
              value={current?.voltage}
              unit="V"
              size="big"
              decimals={0}
              color={VALUE_COLOR}
            />
          </Card>
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Current (Ampere)</CardTitle>
            <ValueDisplay
              value={current?.current}
              unit="A"
              size="big"
              decimals={1}
              color={VALUE_COLOR}
            />
          </Card>
        </div>

        {/* Kolom 2 */}
        <div className="min-h-0 h-full grid grid-rows-3 gap-4 sm:gap-5">
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Frequency (Hz)</CardTitle>
            <ValueDisplay
              value={current?.frequency}
              unit="Hz"
              size="mid"
              decimals={0}
              color="#98B5FC"
            />
          </Card>
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Power (Watt)</CardTitle>
            <ValueDisplay
              value={current?.power}
              unit="W"
              size="mid"
              decimals={0}
              color="#98B5FC"
            />
          </Card>
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Power Factor (Cos φ)</CardTitle>
            <ValueDisplay
              value={current?.power_Factor}
              unit=""
              size="mid"
              decimals={0}
              color="#98B5FC"
            />
          </Card>
        </div>

        {/* Kolom 3 */}
        <div className="min-h-0 h-full grid grid-rows-2 gap-4 sm:gap-5">
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Total Energy Usage (kWh)</CardTitle>
            <div className="flex flex-col items-center justify-center h-full">
              <LabeledValue label="Today">
                <ValueDisplay
                  value={current?.total_energy_usage_today}
                  unit="kWh"
                  size="mid"
                  decimals={0}
                  color={ENERGY_COLOR}
                />
              </LabeledValue>
              <div className="my-1 h-px w-16 mx-auto bg-white/10" aria-hidden />
              <LabeledValue label="MTD">
                <ValueDisplay
                  value={current?.total_energy_usage_Mtd}
                  unit="kWh"
                  size="mid"
                  decimals={0}
                  color={ENERGY_COLOR}
                />
              </LabeledValue>
            </div>
          </Card>
          <Card bg={INFO_CARD_BG}>
            <CardTitle>Total Energy Cost (IDR)</CardTitle>
            <div className="flex flex-col items-center justify-center h-full">
              <LabeledValue label="Today">
                <CurrencyValue
                  value={current?.total_energy_cost_today}
                  size="mid"
                  color={ENERGY_COLOR}
                  decimals={2}
                />
              </LabeledValue>
              <div className="my-1 h-px w-16 mx-auto bg-white/10" aria-hidden />
              <LabeledValue label="MTD">
                <CurrencyValue
                  value={current?.total_energy_cost_mtd}
                  size="mid"
                  color={ENERGY_COLOR}
                  decimals={2}
                />
              </LabeledValue>
            </div>
          </Card>
        </div>
      </div>

      {/* Overlay picker */}
      <DevicePickerOverlay
        open={pickerOpen}
        filtered={filtered}
        selectedId={selectedId}
        setSelected={(id: string) => setSelectedDeviceId(id)}
        query={query}
        setQuery={setQuery}
        hi={hi}
        setHi={setHi}
        onClose={closePicker}
        cardBg={CARD_BG}
        // 🔹 ID untuk state (pakai serial number biar chip tengah = serial)
        getId={(d: any) =>
          String(
            d.device_id ??
              d.serial_number ??
              d.serialNumber ??
              d.serial ??
              ""
          )
        }
        // judul: alamat
        getAddressName={(d: any) =>
          d.address_name ?? d.addressName ?? d.location ?? ""
        }
        // subjudul: detail lokasi
        getDetailLocation={(d: any) =>
          d.detail_location ?? d.detailAddressName ?? ""
        }
        // chip kiri: segment / username
        getSegment={(d: any) => d.segment ?? d.username ?? ""}
        // chip kanan: wattage / phase
        getWattPhase={(d: any) =>
          cleanWattPhase(
            d.wattagePhase ??
            d.wattagephase ?? // lowercase
            d.watt_phase ??
            d.wattage_phase ??
            d.wattage ??
            ""
          )
        }
      />
    </AppPageShell>
  );
}
