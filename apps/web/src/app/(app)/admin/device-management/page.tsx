"use client";

import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import useDeviceManagement from "./useDeviceManagement";
import { toDataRow } from "./validation";

import HeaderBar from "./_components/HeaderBar";
import Controls from "./_components/Controls";
import Tabel from "./_components/Table";
import ConfirmDeleteModal from "./_components/ConfirmDeleteModal";
import EditDeviceModal from "./_components/EditDeviceModal";
import AddDeviceModal from "./_components/AddDeviceModal";
import AppPageShell from "@/components/ui/AppPageShell";
import ToastInline from "@/components/common/ToastMessageInline";
import useToast from "@/components/common/hooks/useToastMessage";
import ConfirmEditMoveModal from "./_components/ConfirmEditMoveModal";
import ConfirmGeocodeModal from "./_components/ConfirmGeocodeModal";
import ConfirmMoveModal from "./_components/ConfirmMoveModal";
import Pagination from "@/components/ui/Pagination";
import { GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

export default function DataTable(): React.JSX.Element {
  const toastApi = useToast();
  const lastToastId = useRef<number>(0);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const {
    search,
    setSearch,
    show,
    setShow,
    currentPage,
    setCurrentPage,
    addDeviceModal,
    setAddDeviceModal,
    loading,
    addMode,
    setAddMode,
    prefillReq,
    setPrefillReq,
    newDevice,
    setNewDevice,
    errors,
    wattageOpt,
    setWattageOpt,
    confirmMove,
    setConfirmMove,
    confirmGeocode,
    setConfirmGeocode,
    confirmEditMove,
    setConfirmEditMove,
    confirmDelete,
    setConfirmDelete,
    editRow,
    setEditRow,
    paginatedData,
    totalPages,
    exportXLS,
    handleDelete,
    handleSaveEdit,
    handleAddDevice,
    geocodeAddress,
    cancelAddModal,
    applyConfirmMove,
    applyConfirmGeocode,
    applyConfirmEditMove,
    toastEvent,
  } = useDeviceManagement();

  useEffect(() => {
    if (!isLoaded) return;
    if (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long)) return;

    const mapContainer = document.querySelector('[aria-label="Map"]');
    if (!mapContainer) return;

    const event = new Event("resize");
    window.dispatchEvent(event);
  }, [newDevice.lat, newDevice.long, isLoaded]);

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
      <HeaderBar
        onAddClick={() => {
          cancelAddModal();
          setAddMode("create");
          setPrefillReq(null);
          setAddDeviceModal(true);
        }}
        onExportClick={exportXLS}
      />

      <Controls
        show={show}
        onChangeShow={setShow}
        search={search}
        onChangeSearch={setSearch}
      />

      <Tabel
        data={paginatedData}
        loading={loading}
        onEdit={(row) => setEditRow(toDataRow(row))}
        onDelete={(row) => setConfirmDelete(toDataRow(row))}
      />

      <Pagination
        show={show}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <ConfirmDeleteModal
        item={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          handleDelete(confirmDelete);
        }}
      />

      <EditDeviceModal
        row={editRow}
        errors={errors}
        isLoaded={isLoaded}
        onChangeRow={(updater) =>
          setEditRow((prev) => (prev ? updater(prev) : prev))
        }
        onClose={() => setEditRow(null)}
        onSave={handleSaveEdit}
        setConfirmEditMove={setConfirmEditMove}
      />

      <AddDeviceModal
        open={addDeviceModal}
        newDevice={newDevice}
        setNewDevice={setNewDevice}
        errors={errors}
        wattageOpt={wattageOpt}
        setWattageOpt={setWattageOpt}  
        isLoaded={isLoaded}
        geocodeAddress={geocodeAddress}
        setConfirmMove={setConfirmMove}
        onCancel={cancelAddModal}
        onSave={handleAddDevice}
      />    
        
      <ConfirmMoveModal
        confirmMove={confirmMove}
        onCancel={() => setConfirmMove(null)}
        onConfirm={applyConfirmMove}
      />

      <ConfirmGeocodeModal
        confirmGeocode={confirmGeocode}
        onCancel={() => setConfirmGeocode(null)}
        onConfirm={applyConfirmGeocode}
      />

      <ConfirmEditMoveModal
        confirmEditMove={confirmEditMove}
        onCancel={() => setConfirmEditMove(null)}
        onConfirm={applyConfirmEditMove}
      />
      
      <ToastInline
        toast={toastApi.toast}
        onClose={toastApi.close}
        placement="top-center"
        aria-live="polite"
      />

    </AppPageShell>
  );
}
