"use client";

import {useRef, useEffect} from "react";
import { useLoadScript } from "@react-google-maps/api";
import useAddDevice from "./useAddDevice";
import { INFO_CARD_BG } from "@/components/ui/theme";
import FormCard from "./_components/FormCard";
import MapCard from "./_components/MapCard";
import HistorySection from "./_components/HistorySection";
import { ConfirmOverlay, DeleteConfirmOverlay, WarningOverlay } from "./_components/Overlays";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastInline from "@/components/common/ToastMessageInline";
import AppPageShell from "@/components/ui/AppPageShell";
import PageHeader from "@/components/ui/PageHeader";
import ModalPortal from "@/components/common/ModalPortal";
import { GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/googleMaps";

export default function AddDevicePage() {
  const toastApi = useToast();
  const lastToastId = useRef<number>(0);

  const { isLoaded } = useLoadScript({
    id: GOOGLE_MAPS_SCRIPT_ID,   
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const {
    form, setForm, errors, markerEdited, setMarkerEdited,
    loading, history, zoom, setZoom, loadingHistory,
    provinceOptions, cityOptions, districtOptions, subdistrictOptions,
    selectProvince, selectCity, selectDistrict, selectSubdistrict,
    handleChange, handleSubmit, doSubmit, doDelete, fetchHistory,
    fmtTime, shortText, statusBadgeClass,
    showOverlayDelete, setShowOverlayDelete,
    deleteTarget, setDeleteTarget, deletingId,
    showOverlayConfirm, setShowOverlayConfirm,
    showOverlayWarning, setShowOverlayWarning,
    toastEvent,
  } = useAddDevice();

  useEffect(() => {
    if (!toastEvent?.type || !toastEvent?.text) return;
    if (lastToastId.current === toastEvent.id) return;
    lastToastId.current = toastEvent.id;

    const showInfo = toastApi.info ?? toastApi.success;
    if (toastEvent.type === "success") toastApi.success(toastEvent.text);
    else if (toastEvent.type === "error") toastApi.error(toastEvent.text);
    else if (toastEvent.type === "danger") toastApi.danger(toastEvent.text); 
    else showInfo(toastEvent.text); 
  }, [toastEvent, toastApi]);

  if (!isLoaded)
    return (
      <div className="text-white text-xs p-4 rounded-2xl border border-white/10" style={{ background: INFO_CARD_BG }}>
        Loading Map...
      </div>
    );

  const inputClass =
    "w-full p-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40";
  const errorClass = "text-red-400 text-[8px] mt-1 text-center";
  const errorClass2 = "text-red-400 text-[10px] mt-1";

  return (
    <AppPageShell scroll="window">
      {/* Header */}
      <PageHeader 
        title="Request New Device"
        subtitle="This is location for your device monitoring"
        align="left"
      />

      <div className="grid grid-cols-12 gap-4 mt-4 max-w-6xl w-full mx-auto">
        <FormCard
          form={form}
          errors={errors}
          provinceOptions={provinceOptions}
          cityOptions={cityOptions}
          districtOptions={districtOptions}
          subdistrictOptions={subdistrictOptions}
          selectProvince={selectProvince}
          selectCity={selectCity}
          selectDistrict={selectDistrict}
          selectSubdistrict={selectSubdistrict}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />

        <MapCard
          form={form}
          setForm={(updater) => setForm((prev) => (typeof updater === "function" ? (updater as any)(prev) : updater))}
          markerEdited={markerEdited}
          setMarkerEdited={setMarkerEdited}
          zoom={zoom}
          setZoom={setZoom}
        />
      </div>

      <HistorySection
        history={history}
        fmtTime={fmtTime}
        shortText={shortText}
        statusBadgeClass={statusBadgeClass}
        onRefresh={fetchHistory}
        loadingHistory={loadingHistory}
        onAskDelete={(r) => {
          setDeleteTarget(r);
          setShowOverlayDelete(true);
        }}
        deletingId={deletingId}
      />
      <ModalPortal
        open={showOverlayDelete || showOverlayWarning || showOverlayConfirm}
        onClose={() => {
          if (showOverlayDelete) {
            setShowOverlayDelete(false);
            setDeleteTarget(null);
          }
          if (showOverlayWarning) {
            setShowOverlayWarning(false);
          }
          if (showOverlayConfirm) {
            setShowOverlayConfirm(false);
          }
        }}
      >
      <DeleteConfirmOverlay
        open={showOverlayDelete && !!deleteTarget}
        onCancel={() => {
          setShowOverlayDelete(false);
          setDeleteTarget(null);
        }}
        onDelete={() => deleteTarget && doDelete(deleteTarget)}
        targetInfo={
          deleteTarget
            ? `${shortText(deleteTarget.address, 80)}`
            : ""
        }
      />

        <WarningOverlay
          open={showOverlayWarning}
          onOK={() => setShowOverlayWarning(false)}
        />

        <ConfirmOverlay
          open={showOverlayConfirm}
          onCancel={() => setShowOverlayConfirm(false)}
          onConfirm={doSubmit}
          lat={form.lat}
          lng={form.lng}
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
