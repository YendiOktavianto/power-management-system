// apps/web/src/app/(reports)/energy-usage/page.tsx (atau DataTable.tsx)
"use client";

import useEnergyUsageReport from "./useEnergyUsageReport";
import { useLocations } from "./useLocation";
import { openPicker } from "./validation";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import Table from "./_components/Table";
import Pagination from "@/components/ui/Pagination";
import AppPageShell from "@/components/ui/AppPageShell";

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

  const { locations, loading } = useLocations();

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
    </AppPageShell>
  );
}
