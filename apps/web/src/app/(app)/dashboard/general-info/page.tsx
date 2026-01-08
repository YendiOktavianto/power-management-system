// apps/web/src/app/(app)/general-info/GeneralInfoContent.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  QrCode,
  MapPin,
  Zap,
  Tags,
  Cpu,
  ClipboardCopy,
} from "lucide-react";
import QRCode from "qrcode";
import { useGeneralInfo } from "./useGeneralInfo";
import {
  idOf,
  nameOf,
  detailOf,
  API_GENERAL_INFO_QR,
  API_GENERAL_INFO_VERIFY,
  API_GENERAL_INFO_DETAIL,
  API_GENERAL_INFO_UNLOCK_STATUS,
  numericIdOf,
  authHeaders,
} from "./constants";
import { safe, copy, maskIfLocked } from "./validation";
import type { Device } from "./types";
import { Row, StatusBadge, LockedOverlay } from "./_components";
import DevicePickerOverlay from "@/components/features/device-picker/DevicePickerOverlay";
import AppPageShell from "@/components/ui/AppPageShell";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import InfoCard from "@/app/(app)/dashboard/_components/InfoCard";
import { useSelectedDevice } from "../useSelectedDevice";

function GeneralInfoHeader({ count }: { count: number }) {
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="General Info"
          subtitle="Device identity and status summary"
          align="left"
        />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 text-white/80 backdrop-blur-md">
            <Cpu className="h-3.5 w-3.5" />
            {count} device{count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

type DeviceWithIndex = { d: Device; idx: number };

type DetailPayload = {
  deviceId: number | null;
  serialNumber: string | null;
  wattagePhase: string | null;
  segment: string | null;
  location: string | null;
  powerState: "Active" | "Inactive" | null;
  lastUpdate: string | null;
  unlocked?: boolean;
};

type UnlockParams = {
  deviceId?: number;
  token: string;
};

const UNLOCK_CACHE_KEY = "ems_gi_unlock_cache_v1";

function saveUnlockCache(deviceId: number | null, token: string | null) {
  if (!deviceId || !token) return;
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(UNLOCK_CACHE_KEY);
    const cache: Record<
      string,
      { token: string; ts: number }
    > = raw ? JSON.parse(raw) : {};

    cache[String(deviceId)] = {
      token,
      ts: Date.now(),
    };

    window.localStorage.setItem(UNLOCK_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("[GI] saveUnlockCache error", e);
  }
}

function getCachedUnlockToken(deviceId: number): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(UNLOCK_CACHE_KEY);
    if (!raw) return null;

    const cache: Record<
      string,
      { token: string; ts: number }
    > = JSON.parse(raw);

    const item = cache[String(deviceId)];
    if (!item || typeof item.token !== "string") return null;

    const THIRTY_DAYS = Infinity;

    if (Date.now() - item.ts > THIRTY_DAYS) {
      return null;
    }

    return item.token;
  } catch (e) {
    console.error("[GI] getCachedUnlockToken error", e);
    return null;
  }
}

export default function GeneralInfoContent() {
  const storeDeviceId = useSelectedDevice((s) => s.deviceId);
  const setStoreDeviceId = useSelectedDevice((s) => s.setDeviceId);

  const {
    devices = [],
    selectedDeviceIndex,
    setSelectedDeviceIndex,
    currentDevice,
  } = useGeneralInfo();

  const reduce = useReducedMotion();

  const serialText = String(
    safe(currentDevice?.serial_number ?? currentDevice?.device_id)
  );

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [qrUrl, setQrUrl] = React.useState<string>("");

  const [detail, setDetail] = React.useState<DetailPayload | null>(null);
  const [unlocked, setUnlocked] = React.useState(false);

  const [unlockParams, setUnlockParams] =
    React.useState<UnlockParams | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const dParam =
      url.searchParams.get("d") ??
      url.searchParams.get("deviceId") ??
      url.searchParams.get("device");
    const tParam =
      url.searchParams.get("t") ?? url.searchParams.get("token");

    if (!tParam) {
      setUnlockParams(null);
      return;
    }

    let numericDeviceId: number | undefined;
    if (dParam) {
      const parsed = Number(dParam);
      if (Number.isFinite(parsed) && parsed > 0) {
        numericDeviceId = parsed;
      }
    }

    setUnlockParams({
      deviceId: numericDeviceId,
      token: tParam,
    });
  }, []);

  const list = React.useMemo<DeviceWithIndex[]>(
    () => (devices || []).map((d, idx) => ({ d, idx })),
    [devices]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(({ d }) =>
      `${idOf(d)} ${nameOf(d)} ${detailOf(d)}`.toLowerCase().includes(q)
    );
  }, [query, list]);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const pos = filtered.findIndex(({ idx }) => idx === selectedDeviceIndex);
    setActiveIdx(pos >= 0 ? pos : 0);
  }, [pickerOpen, filtered, selectedDeviceIndex]);

  React.useEffect(() => {
    if (!storeDeviceId || !devices.length) return;

    const found = devices.findIndex(
      (d) =>
        idOf(d) === storeDeviceId ||
        (d as any).serial_number === storeDeviceId ||
        (d as any).device_id === storeDeviceId
    );

    if (found >= 0 && found !== selectedDeviceIndex) {
      setSelectedDeviceIndex(found);
    }
  }, [storeDeviceId, devices, selectedDeviceIndex, setSelectedDeviceIndex]);

  React.useEffect(() => {
    if (!currentDevice) {
      setQrUrl("");
      return;
    }

    const controller = new AbortController();

    async function loadQr() {
      try {
        const numericId = numericIdOf(currentDevice);
        if (!numericId) {
          setQrUrl("");
          return;
        }

        const url = new URL(API_GENERAL_INFO_QR);
        url.searchParams.set("deviceId", String(numericId));

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error(
            "Failed to get QR token",
            res.status,
            await res.text().catch(() => "")
          );
          setQrUrl("");
          return;
        }

        const json = await res.json().catch(() => null as any);

        const devId = json?.deviceId ?? numericId;
        const token = typeof json?.token === "string" ? json.token : "";

        let payload: string | null =
          typeof json?.qrPayload === "string" &&
          json.qrPayload.trim().length > 0
            ? json.qrPayload.trim()
            : null;

        if (!payload) {
          const origin =
            typeof window !== "undefined"
              ? window.location.origin
              : process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000";

          const deepLink = new URL("dashboard/general-info", origin);

          if (token) {
            deepLink.searchParams.set("t", token);
          } else {
            deepLink.searchParams.set("deviceId", String(devId));
          }

          payload = deepLink.toString();
        }

        console.log("[GI] QR payload:", payload);

        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 6,
        });

        setQrUrl(dataUrl);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Error generating QR", e);
        setQrUrl("");
      }
    }

    loadQr();
    return () => controller.abort();
  }, [currentDevice]);

  React.useEffect(() => {
    if (!unlockParams) return;
    if (!devices.length) return;

    const controller = new AbortController();
    const devicesSnapshot = devices;

    async function run(params: UnlockParams, list: Device[]) {
      const { token } = params;

      let effectiveDeviceId: number | null =
        typeof params.deviceId === "number" && Number.isFinite(params.deviceId)
          ? params.deviceId
          : null;

      // kalau sudah tahu deviceId dari URL → sinkron pilihan dulu
      if (effectiveDeviceId != null) {
        const idx = list.findIndex((d) => {
          const numeric = (d as any).numericId ?? (d as any).id;
          return (
            String(numeric ?? "") === String(effectiveDeviceId) ||
            String((d as any).device_id ?? "") === String(effectiveDeviceId)
          );
        });
        if (idx >= 0) {
          setSelectedDeviceIndex(idx);
        }
      }

      try {
        const verifyBody: any = { token };
        if (effectiveDeviceId != null) {
          verifyBody.deviceId = effectiveDeviceId;
        }

        const verifyRes = await fetch(API_GENERAL_INFO_VERIFY, {
          method: "POST",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          credentials: "include",
          body: JSON.stringify(verifyBody),
          signal: controller.signal,
        });

        const verifyText = await verifyRes.text().catch(() => "");
        console.log("[GI] verify (local)", verifyRes.status, verifyText);

        if (!verifyRes.ok) {
          setUnlocked(false);
          setDetail(null);
          return;
        }

        setUnlocked(true);

        // ambil detail: kalau deviceId belum ada, BE bisa identifikasi dari token
        const detailUrl = new URL(API_GENERAL_INFO_DETAIL);
        if (effectiveDeviceId != null) {
          detailUrl.searchParams.set("deviceId", String(effectiveDeviceId));
        }
        detailUrl.searchParams.set("token", token);

        const detailRes = await fetch(detailUrl.toString(), {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          signal: controller.signal,
        });

        const detailText = await detailRes.text().catch(() => "");
        console.log("[GI] detail (local)", detailRes.status, detailText);

        if (!detailRes.ok) {
          return;
        }

        let body: any = null;
        try {
          body = detailText ? JSON.parse(detailText) : null;
        } catch {
          body = null;
        }

        if (body && typeof body === "object") {
          // kalau sebelumnya tidak punya deviceId, ambil dari response
          if (
            effectiveDeviceId == null &&
            typeof body.deviceId === "number" &&
            Number.isFinite(body.deviceId)
          ) {
            effectiveDeviceId = body.deviceId;

            const idx = list.findIndex((d) => {
              const numeric = (d as any).numericId ?? (d as any).id;
              return (
                String(numeric ?? "") === String(effectiveDeviceId) ||
                String((d as any).device_id ?? "") === String(effectiveDeviceId)
              );
            });

            if (idx >= 0) {
              setSelectedDeviceIndex(idx);
            }
          }

          const mapped: DetailPayload = {
            deviceId:
              (typeof body.deviceId === "number" &&
              Number.isFinite(body.deviceId)
                ? body.deviceId
                : null) ?? effectiveDeviceId ?? null,
            serialNumber: body.serialNumber ?? null,
            wattagePhase: body.wattagePhase ?? null,
            segment: body.segment ?? null,
            location: body.location ?? null,
            powerState: body.powerState ?? null,
            lastUpdate: body.lastUpdate ?? null,
            unlocked: body.unlocked,
          };

          // 🔹 simpan ke cache → 1x scan per browser
          saveUnlockCache(mapped.deviceId, token);

          setDetail(mapped);
        } else {
          setDetail(null);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("unlock/detail error (local)", e);
        setUnlocked(false);
        setDetail(null);
      }
    }

    run(unlockParams, devicesSnapshot);

    return () => controller.abort();
  }, [unlockParams, devices, setSelectedDeviceIndex]);

  // 🔹 3. Remote unlock: browser INI tidak punya token di URL → coba pakai cache, kalau tidak ada baru polling unlock-status
  React.useEffect(() => {
    if (unlockParams) return; // kalau ini instance yang dibuka dari QR, pakai flow di atas

    const numeric = numericIdOf(currentDevice);
    if (!numeric) {
      setUnlocked(false);
      setDetail(null);
      return;
    }

    // reset dulu setiap ganti device
    setUnlocked(false);
    setDetail(null);

    let cancelled = false;

    // coba auto-unlock pakai token yang tersimpan di localStorage
    async function tryUseCachedToken(deviceId: number): Promise<boolean> {
      if (cancelled) return false;

      const token = getCachedUnlockToken(deviceId);
      if (!token) return false;

      try {
        const verifyBody: any = { token, deviceId };

        const verifyRes = await fetch(API_GENERAL_INFO_VERIFY, {
          method: "POST",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          credentials: "include",
          body: JSON.stringify(verifyBody),
        });

        const verifyText = await verifyRes.text().catch(() => "");
        console.log("[GI] verify (cache)", verifyRes.status, verifyText);

        if (!verifyRes.ok || cancelled) {
          return false;
        }

        setUnlocked(true);

        const detailUrl = new URL(API_GENERAL_INFO_DETAIL);
        detailUrl.searchParams.set("deviceId", String(deviceId));
        detailUrl.searchParams.set("token", token);

        const detailRes = await fetch(detailUrl.toString(), {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
        });

        const detailText = await detailRes.text().catch(() => "");
        console.log("[GI] detail (cache)", detailRes.status, detailText);

        if (!detailRes.ok || cancelled) {
          return false;
        }

        let body: any = null;
        try {
          body = detailText ? JSON.parse(detailText) : null;
        } catch {
          body = null;
        }

        if (body && typeof body === "object") {
          const mapped: DetailPayload = {
            deviceId:
              (typeof body.deviceId === "number" &&
              Number.isFinite(body.deviceId)
                ? body.deviceId
                : null) ?? deviceId,
            serialNumber: body.serialNumber ?? null,
            wattagePhase: body.wattagePhase ?? null,
            segment: body.segment ?? null,
            location: body.location ?? null,
            powerState: body.powerState ?? null,
            lastUpdate: body.lastUpdate ?? null,
            unlocked: body.unlocked,
          };
          setDetail(mapped);
          return true;
        }

        return false;
      } catch (e: any) {
        console.error("cached unlock error", e);
        return false;
      }
    }

    async function loop(deviceId: number) {
      // 🔹 3a. Coba dulu pakai cache token
      const usedCache = await tryUseCachedToken(deviceId);
      if (usedCache || cancelled) return;

      // 🔹 3b. Kalau cache gagal / tidak ada → pakai mekanisme polling unlock-status seperti sebelumnya
      while (!cancelled) {
        try {
          const url = new URL(API_GENERAL_INFO_UNLOCK_STATUS);
          url.searchParams.set("deviceId", String(deviceId));

          const res = await fetch(url.toString(), {
            method: "GET",
            headers: authHeaders(),
            credentials: "include",
          });

          const text = await res.text().catch(() => "");
          console.log("[GI] unlock-status", res.status, text);

          if (res.ok) {
            let body: any = null;
            try {
              body = text ? JSON.parse(text) : null;
            } catch {
              body = null;
            }

            const isUnlocked =
              body && typeof body === "object" && body.unlocked === true;

            if (isUnlocked) {
              // ✅ sudah diverifikasi oleh device lain (HP)
              setUnlocked(true);

              // ambil detail TANPA token (BE pakai flag memory)
              const detailUrl = new URL(API_GENERAL_INFO_DETAIL);
              detailUrl.searchParams.set("deviceId", String(deviceId));

              const detailRes = await fetch(detailUrl.toString(), {
                method: "GET",
                headers: authHeaders(),
                credentials: "include",
              });

              const detailText = await detailRes.text().catch(() => "");
              console.log(
                "[GI] detail (remote)",
                detailRes.status,
                detailText
              );

              if (detailRes.ok) {
                try {
                  const bodyDetail = detailText
                    ? JSON.parse(detailText)
                    : null;
                  if (bodyDetail && typeof bodyDetail === "object") {
                    const mapped: DetailPayload = {
                      deviceId:
                        (typeof bodyDetail.deviceId === "number" &&
                        Number.isFinite(bodyDetail.deviceId)
                          ? bodyDetail.deviceId
                          : null) ?? deviceId,
                      serialNumber: bodyDetail.serialNumber ?? null,
                      wattagePhase: bodyDetail.wattagePhase ?? null,
                      segment: bodyDetail.segment ?? null,
                      location: bodyDetail.location ?? null,
                      powerState: bodyDetail.powerState ?? null,
                      lastUpdate: bodyDetail.lastUpdate ?? null,
                      unlocked: bodyDetail.unlocked,
                    };
                    setDetail(mapped);
                  }
                } catch {
                  // ignore parse error
                }
              }

              break; // stop polling
            }
          }

          // delay 3 detik sebelum cek lagi
          await new Promise((r) => setTimeout(r, 3000));
        } catch (e) {
          console.error("unlock-status loop error", e);
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    loop(numeric);

    return () => {
      cancelled = true;
    };
  }, [currentDevice, unlockParams]);

  // 🔹 4. Nilai display
  const displaySerial =
    (unlocked ? detail?.serialNumber : null) ??
    currentDevice?.serial_number ??
    currentDevice?.device_id;

  const displayLocation =
    (unlocked ? detail?.location : null) ??
    currentDevice?.location ??
    currentDevice?.address_name;

  const displayWattPhase =
    (unlocked ? detail?.wattagePhase : null) ??
    currentDevice?.wattage ??
    currentDevice?.watt_phase;

  const displaySegment =
    (unlocked ? detail?.segment : null) ?? currentDevice?.segment;

  const activeFromDetail =
    unlocked && detail?.powerState
      ? detail.powerState === "Active"
      : undefined;

  // 🔹 5. UI
  return (
    <AppPageShell>
      <GeneralInfoHeader count={list.length} />

      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start max-w-7xl w-full flex-1">
        <motion.aside
          initial={reduce ? false : { x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 240, damping: 22 }
          }
          className="col-span-12 md:col-span-4"
        >
          <InfoCard
            title="Device"
            variant="compact"
            rightSlot={
              <button
                onClick={() => copy(serialText)}
                className="inline-flex items-center gap-1.5 text-[10px] text-white/70 hover:text-white transition justify-start"
                aria-label="Copy serial"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy
              </button>
            }
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <QrCode className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-white text-sm font-medium truncate break-words">
                {serialText}
              </p>
            </div>

            <div className="relative">
              <div className="relative mx-auto aspect-square w-[42vw] max-w-[160px] sm:max-w-[180px] md:w-[180px] rounded-xl border border-white/10 overflow-hidden bg-white/5">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR unlock untuk ${serialText}`}
                    className="object-contain w-full h-full p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    <QrCode className="h-10 w-10" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-white/60 mt-2 text-center">
                Scan QR for{" "}
                {unlocked ? "membuka ulang" : "unlocked"} access device info
              </p>
            </div>

            {devices.length > 0 && (
              <div className="mt-3">
                <Button
                  label="Search device here"
                  leftIcon={
                    <Search
                      className="h-4 w-4 -mt-px opacity-80"
                      aria-hidden="true"
                    />
                  }
                  size="md"
                  variant="secondary"
                  radius="xl"
                  onClick={() => setPickerOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPickerOpen(true);
                    }
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={pickerOpen}
                />
              </div>
            )}
          </InfoCard>
        </motion.aside>

        <section className="col-span-12 md:col-span-8 space-y-3">
          <InfoCard
            title="Overview"
            align="left"
            className={!unlocked ? "relative" : ""}
          >
            {!unlocked && <LockedOverlay />}

            <div className="divide-y divide-white/5">
              <Row
                icon={<Cpu className="h-4 w-4" />}
                label="Serial Number"
                value={maskIfLocked(unlocked, safe(displaySerial))}
              />
              <Row
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={
                  unlocked ? (
                    <>
                      {safe(displayLocation, "-")}
                      {currentDevice?.detail_location ? (
                        <span className="text-white/60">
                          {" "}
                          | {currentDevice.detail_location}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="select-none">—</span>
                  )
                }
              />
              <Row
                icon={<Zap className="h-4 w-4" />}
                label="Wattage / Phase"
                value={maskIfLocked(unlocked, safe(displayWattPhase))}
              />
              <Row
                icon={<Tags className="h-4 w-4" />}
                label="Segment"
                value={maskIfLocked(unlocked, safe(displaySegment))}
              />
            </div>
          </InfoCard>

          <InfoCard
            title="Power State"
            variant="compact"
            align="left"
            className={!unlocked ? "relative" : ""}
          >
            {!unlocked && <LockedOverlay subtle />}
            <div className="flex items-center gap-3">
              <StatusBadge active={activeFromDetail} />
              <p className="text-white/60 text-xs text-end">
                {unlocked
                  ? "Current device status"
                  : "Locked — scan QR to see status"}
              </p>
            </div>
          </InfoCard>
        </section>
      </div>

      <DevicePickerOverlay
        mode="legacy"
        open={pickerOpen}
        query={query}
        setQuery={setQuery}
        filtered={filtered}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        totalCount={list.length}
        onClose={() => {
          setPickerOpen(false);
          setQuery("");
        }}
        onPick={(idx) => {
          setSelectedDeviceIndex(idx);
          const picked = devices[idx];
          if (picked) {
            setStoreDeviceId(idOf(picked));
          }
          setPickerOpen(false);
          setQuery("");
        }}
      />
    </AppPageShell>
  );
}
