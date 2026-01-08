 "use client";

import { useDeviceRequests } from "./useDeviceRequest";
import HeaderBar from "./_components/HeaderBar";
import ControlsBar from "./_components/ControlsBar";
import RequestsTable from "./_components/Table";
import PaginationBar from "@/components/ui/Pagination";
import AppPageShell from "@/components/ui/AppPageShell";

export default function AdminDeviceRequests(): React.JSX.Element {
  const {
    paginatedData,
    totalPages,
    search,
    setSearch,
    show,
    setShow,
    currentPage,
    setCurrentPage,
    loading,
    errMsg,
    handleAction,
    rowNumber,
  } = useDeviceRequests();

  return (
    <AppPageShell>
      <HeaderBar errMsg={errMsg} />

      {/* Controls */}
      <ControlsBar show={show} setShow={setShow} search={search} setSearch={setSearch} />

      {/* Table */}
      <RequestsTable
        rows={paginatedData}
        loading={loading}
        handleAction={handleAction}
        rowNumber={rowNumber}
      />

      {/* Pagination */}
      <PaginationBar
        show={show}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </AppPageShell>
  );
}
