"use client";

import useSummaryReport from "./useSummaryReport";
import { useLocations } from "./useLocations";
import { openPicker } from "./validation";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import Table from "./_components/Table";
import Pagination from "@/components/ui/Pagination";
import AppPageShell from "@/components/ui/AppPageShell";

// helper untuk format tanggal ke "13 November 2025"
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
    // state
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
    paginatedData, // ⬅️ INI yang dipakai ke Table
    totalPages,
    exportXLS,
  } = useSummaryReport();

  const { locations, loading } = useLocations();

  // bantu debug
  console.log("PQ rows:", paginatedData, { filterDate, selectedLocation, locations });

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
    </AppPageShell>
  );
}
