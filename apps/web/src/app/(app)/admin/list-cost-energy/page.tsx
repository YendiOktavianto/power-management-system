"use client";

import React, { useEffect, useRef }  from "react";

import useListCostEnergy from "./useListCostEnergy";
import HeaderBar from "./_components/HeaderBar";
import ControlsBar from "./_components/ControlsBar";
import DataTableView from "./_components/Table";
import PaginationBar from "@/components/ui/Pagination";
import AddDataModal from "./_components/AddDataModal";
import AppPageShell from "@/components/ui/AppPageShell";
import ModalPortal from "@/components/common/ModalPortal";
import ToastInline from "@/components/common/ToastMessageInline";
import useToast from "@/components/common/hooks/useToastMessage";

export default function DataTable(): React.JSX.Element {
  const toastApi = useToast();
  const lastToastId = useRef<number>(0);
  useEffect(() => {

    if (typeof window === "undefined") return;
      const originalAlert = window.alert;

      window.alert = (msg?: any) => {
        const text = typeof msg === "string" ? msg : String(msg ?? "");
        // munculkan sebagai toast error saja
        toastApi.error(text || "Something went wrong");
        console.log("[alert intercepted]:", text);
      };

    return () => {
      window.alert = originalAlert;
    };
  }, [toastApi]);

  const {
    // control
    search, setSearch,
    show, setShow,
    currentPage, setCurrentPage,
    filterDate, setFilterDate,
    timeFrom, setTimeFrom,
    timeTo, setTimeTo,
    showAddModal, setShowAddModal,

    // data & derived
    paginatedData,
    totalPages,
    filteredData,

    // form add
    newPower, setNewPower,
    newCost, setNewCost,
    newValidFrom, setNewValidFrom,
    newValidUntil, setNewValidUntil,
    formErrors,
    apiError,
    toastEvent,

    // actions
    exportXLS,
    handleAddNewData,
    submitting,
  } = useListCostEnergy();

  
  useEffect(() => {
    if (!toastEvent?.type || !toastEvent?.text) return;
    if (lastToastId.current === toastEvent.id) return;
    lastToastId.current = toastEvent.id;
    if (toastEvent.type === "success") toastApi.success(toastEvent.text);
    else if (toastEvent.type === "error") toastApi.error(toastEvent.text);
    else if (toastEvent.type === "danger") toastApi.danger(toastEvent.text);
    else toastApi.info(toastEvent.text);
  }, [toastEvent, toastApi]);

  return (
    <AppPageShell>
      {/* Header */}
      <HeaderBar onOpenAdd={() => setShowAddModal(true)} onExport={exportXLS} />

      {/* Controls */}
      <ControlsBar
        show={show}
        setShow={setShow}
        search={search}
        setSearch={setSearch}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        timeFrom={timeFrom}
        setTimeFrom={setTimeFrom}
        timeTo={timeTo}
        setTimeTo={setTimeTo}
      />

      {/* Table */}
      <DataTableView rows={paginatedData as any} />

      {/* Pagination */}
      <PaginationBar
        show={show}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {/* Modal Add New Data */}
      <ModalPortal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddDataModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          filteredData={filteredData as any}
          newPower={newPower}
          setNewPower={setNewPower}
          newCost={newCost}
          setNewCost={setNewCost}
          newValidFrom={newValidFrom}
          setNewValidFrom={setNewValidFrom}
          newValidUntil={newValidUntil}        
          setNewValidUntil={setNewValidUntil}
          formErrors={formErrors}
          apiError={apiError}
          submitting={submitting}
          onSubmit={handleAddNewData}
        />
      </ModalPortal>
      <ToastInline
        toast={toastApi.toast}
        onClose={toastApi.close}
        placement="top-center"
        aria-live="polite"
      />
    </AppPageShell>
  );
}
