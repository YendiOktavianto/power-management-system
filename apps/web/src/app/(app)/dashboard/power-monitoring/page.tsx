// app/(dashboard)/dashboard/power-monitoring/page.tsx
"use client";

import React, { createElement, useCallback } from "react";
import { POWER_SECTIONS, type PowerKey, SectionMap } from "./constants";

import usePowerMonitoring from "./usePowerMonitoring";
import { getLocationLabel } from "./validation";

import DevicePickerOverlay from "@/components/features/device-picker/DevicePickerOverlay";
import Header from "@/components/features/device-picker/DeviceInfoHeaderSimple";
import AppPageShell from "@/components/ui/AppPageShell";
import DeviceHud from "@/components/features/device-picker/DeviceHud";
import { CARD_BG } from "@/components/ui/theme";

export default function PowerMonitoringPage() {
  const {
    LOCS,
    activeLoc,
    setSelectedLocation,
    pickerOpen,
    setPickerOpen,
    query,
    setQuery,
    hi,
    setHi,
    filtered,
    pickBtnRef,
    closePicker,
    refs,
    headRef,
    showHUD,
  } = usePowerMonitoring();

  const devicesView = LOCS;
  const selectedId = activeLoc?.device_id ?? "";

  const handleSelect = useCallback(
    (id: string) => {
      const idx = LOCS.findIndex((l) => l.device_id === id);
      if (idx >= 0) {
        setSelectedLocation(idx);
      }
    },
    [LOCS, setSelectedLocation]
  );

  return (
    <AppPageShell scroll="window">
      <Header
        title="Power Monitoring"
        headRef={headRef}
        devicesView={devicesView}
        selectedId={selectedId}
        setSelected={handleSelect}
        current={activeLoc as any}
        onOpenPicker={() => setPickerOpen(true)}
        pickBtnRef={pickBtnRef}
        forceOverlay
      />

      <div className="space-y-[80px]">
        {POWER_SECTIONS.map(({ key, id }) => {
          const Comp = SectionMap[key as PowerKey];
          return (
            <section
              key={`${id}-${activeLoc?.device_id ?? "none"}`}
              id={id}
              data-key={key}
              ref={(el) => {
                refs[key as PowerKey].el = el;
              }}
              className="scroll-mt-21"
            >
              {createElement(Comp, { device: activeLoc })}
            </section>
          );
        })}
      </div>

      <DeviceHud
        show={showHUD}
        deviceId={activeLoc?.device_id}
        locationLabel={getLocationLabel(activeLoc)}
        onChange={() => setPickerOpen(true)}
      />

      <DevicePickerOverlay
        open={pickerOpen}
        filtered={filtered}
        selectedId={selectedId}
        setSelected={handleSelect}
        query={query}
        setQuery={setQuery}
        hi={hi}
        setHi={setHi}
        onClose={() => {
          setQuery("");
          closePicker();
        }}
        cardBg={CARD_BG}
      />
    </AppPageShell>
  );
}
