"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSummaryReport from "./useSummaryReport";
import { useLocations } from "./useLocations";
import { openPicker } from "./validation";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import Table from "./_components/Table";
import Pagination from "@/components/ui/Pagination";
import AppPageShell from "@/components/ui/AppPageShell";
import DevicePickerOverlay from "@/components/features/device-picker/DevicePickerOverlay";

// helper format tanggal ke "13 November 2025"
function formatDate(value: string | undefined | null) {
  if (!value) return "-";

  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [_, y, m, d] = match;
    const simple = new Date(Number(y), Number(m) - 1, Number(d));
    return simple.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return value;
}

export default function DataTable() {
  const {
    search,
    setSearch,
    debouncedSearch,
    show,
    setShow,
    currentPage,
    setCurrentPage,
    filterDate,
    setFilterDate,
    timeFrom,
    setTimeFrom,
    timeTo,
    setTimeTo,
    selectedLocation,
    setSelectedLocation,
    paginatedData,
    totalPages,
    exportXLS,
  } = useSummaryReport();

  const { locations, rawDevices, loading } = useLocations() as any;

  // 🔹 state untuk overlay
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);

  // label lokasi terpilih
  const locationLabel =
    locations.find((loc: any) => loc.id === selectedLocation)?.name ||
    (locations.length ? "Pilih lokasi" : "No locations");

  // filter data untuk overlay
  const filteredDevices = useMemo(() => {
    if (!Array.isArray(rawDevices)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rawDevices;

    return rawDevices.filter((d: any) => {
      const addr   = (d.addressName ?? "").toLowerCase();
      const detail = (d.detailAddressName ?? "").toLowerCase();
      const id     = String(d.deviceId ?? d.device_id ?? "").toLowerCase();
      const user   = (d.username ?? "").toLowerCase();
      const serial = (d.serial_number ?? d.serialNumber ?? "").toLowerCase();

      return (
        addr.includes(q) ||
        detail.includes(q) ||
        id.includes(q) ||
        user.includes(q) ||
        serial.includes(q)
      );
    });
  }, [rawDevices, query]);

  // auto-select device pertama saat data lokasi sudah ada & belum ada pilihan
  useEffect(() => {
    if (!selectedLocation && locations.length > 0) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation, setSelectedLocation]);

  const tableRows = paginatedData.map((row) => ({
    ...row,
    date: formatDate(row.date),
  }));

  return (
    <AppPageShell>
      <HeaderBar onExport={exportXLS} />

      <Controls
        show={show}
        setShow={setShow}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        timeFrom={timeFrom}
        setTimeFrom={setTimeFrom}
        timeTo={timeTo}
        setTimeTo={setTimeTo}
        locations={locations}
        openPicker={openPicker}
        // ⬇️ tambahan
        onOpenLocationPicker={() => setPickerOpen(true)}
        locationLabel={locationLabel}
      />

      <Table rows={tableRows} />

      {show !== -1 && (
        <Pagination
          show={show}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* 🔹 Overlay device picker (mode generic) */}
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

        // ⬅️ ID asli, TANPA "Device id ..."
        getId={(d: any) => String(d.deviceId ?? d.device_id ?? d.id)}

        // kiri: lokasi (detail) & alamat
        getDetailLocation={(d: any) => d.detailAddressName ?? d.detail_location ?? ""}
        getAddressName={(d: any) => d.addressName ?? d.address_name ?? ""}

        // chip 1: username
        getSegment={(d: any) => d.username ?? ""}

        // chip 2: serial number
        getWattPhase={(d: any) => d.serialNumber ?? d.serial_number ?? ""}
      />


    </AppPageShell>
  );
}
