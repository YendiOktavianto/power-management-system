// apps/web/src/app/(reports)/energy-usage/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import useEnergyUsageReport from "./useEnergyUsageReport";
import { useLocations } from "./useLocations";
import { openPicker } from "./validation";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import Table from "./_components/Table";
import Pagination from "@/components/ui/Pagination";
import AppPageShell from "@/components/ui/AppPageShell";
import DevicePickerOverlay from "@/components/features/device-picker/DevicePickerOverlay";

export default function DataTable() {
  const {
    show,
    setShow,
    currentPage,
    setCurrentPage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedLocation,
    setSelectedLocation,
    paginatedData,
    totalPages,
    totals,
    exportXLS,
  } = useEnergyUsageReport();

  // lokasi dari /locations/listAll (admin)
  const { locations, rawDevices, loading } = useLocations() as any;

  // state overlay
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);

  // auto-pilih device pertama kalau belum ada pilihan
  useEffect(() => {
    if (!selectedLocation && locations.length > 0) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation, setSelectedLocation]);

  // label lokasi di tombol filter
  const locationLabel =
    locations.find((loc: any) => loc.id === selectedLocation)?.name ||
    (locations.length ? "Pilih lokasi" : "No locations");

  // filter list device di overlay
  const filteredDevices = useMemo(() => {
    if (!Array.isArray(rawDevices)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rawDevices;

    return rawDevices.filter((d: any) => {
      const addr   = (d.addressName ?? "").toLowerCase();
      const detail = (d.detailAddressName ?? "").toLowerCase();
      const id     = String(d.deviceId ?? d.device_id ?? d.id).toLowerCase();
      const user   = (d.username ?? "").toLowerCase();
      const serial = (d.serialNumber ?? d.serial_number ?? "").toLowerCase();

      return (
        addr.includes(q) ||
        detail.includes(q) ||
        id.includes(q) ||
        user.includes(q) ||
        serial.includes(q)
      );
    });
  }, [rawDevices, query]);

  console.log("Energy rows:", paginatedData, {
    selectedLocation,
    dateFrom,
    dateTo,
    locations,
    loading,
  });

  return (
    <AppPageShell>
      <HeaderBar onExport={exportXLS} />

      <Controls
        show={show}
        setShow={setShow}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        locations={locations}
        openPicker={openPicker}
        onOpenLocationPicker={() => setPickerOpen(true)}
        locationLabel={locationLabel}
      />

      <Table rows={paginatedData} totals={totals} />

      {show !== -1 && (
        <Pagination
          show={show}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Overlay pemilih device (mode generic) */}
      <DevicePickerOverlay
        mode="generic"
        open={pickerOpen}
        filtered={filteredDevices}
        selectedId={selectedLocation}
        setSelected={(id: string) => {
          setSelectedLocation(id);
          setPickerOpen(false);
        }}
        query={query}
        setQuery={setQuery}
        hi={hi}
        setHi={setHi}
        onClose={() => setPickerOpen(false)}
        cardBg="#032d7a"
        // ID asli device, dipakai internal (query ke BE)
        getId={(d: any) => String(d.deviceId ?? d.device_id ?? d.id)}
        // kiri: lokasi + alamat detail
        getDetailLocation={(d: any) =>
          d.detailAddressName ?? d.detail_addressName ?? d.detail_address_name ?? ""
        }
        getAddressName={(d: any) => d.addressName ?? d.address_name ?? ""}
        // chip 1: username
        getSegment={(d: any) => d.username ?? ""}
        // chip 2: serial number
        getWattPhase={(d: any) => d.serialNumber ?? d.serial_number ?? ""}
      />
    </AppPageShell>
  );
}
