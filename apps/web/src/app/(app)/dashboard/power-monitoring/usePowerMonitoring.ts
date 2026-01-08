"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { POWER_SECTIONS, PowerKey, slugify, TOP_OFFSET } from "./constants";
import { getLocationLabel, safeLower } from "./validation";
import type { Location } from "./types";
import { fetchMyDevices, type DeviceOption } from "./api";


function fmtWattPhase(watt?: number | string | null, phase?: number | string | null) {
  const w =
    watt == null || watt === ""
      ? ""
      : typeof watt === "number"
      ? `${watt}VA`
      : /(?:VA|kVA|W)$/i.test(watt)
      ? watt.trim()
      : `${watt}VA`;

  let p = "";
  if (phase != null && phase !== "") {
    if (typeof phase === "number") p = `${phase}-Phase`;
    else {
      const s = String(phase).trim();
      const m = s.match(/\d+/);
      p = m ? `${m[0]}-Phase` : (/(?:phase)/i.test(s) ? s : `${s}-Phase`);
    }
  }
  return [w, p].filter(Boolean).join(" / ");
}

export default function usePowerMonitoring() {
  const [locations, setLocations] = useState<Location[]>([]);
  const LOCS = locations;

  const [selectedLocation, setSelectedLocation] = useState(0);
  const arr = locations.length ? locations : LOCS;
  const activeLoc = arr[selectedLocation] ?? arr[0];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchMyDevices();

        const mapped: Location[] = rows.map((r: DeviceOption) => ({
          id: Number(r.device_id),
          // Header menampilkan “Serial Number” ⇒ pakai serial_number; fallback ke device_id
          device_id: String(r.serial_number ?? r.device_id ?? ""),

          // “Location” ⇒ pakai address_name + detail_address_name
          address_name: r.address_name ?? r.location?.address_name ?? "",
          detail_location: r.detail_location ?? r.location?.detail_address_name ?? "",

          // “Wattage / Phase” ⇒ gabungkan
           watt_phase:
            (r as any).watt_phase ??
            fmtWattPhase(
              r.wattage ?? r.general_info?.wattage,
              r.phase ?? r.general_info?.phase
            ),

          // “Segment”
          segment: r.segment ?? r.location?.segment ?? "",
        }));

        if (!alive) return;
        setLocations(mapped);
      } catch {
        // biarkan kosong ⇒ UI akan fallback ke mock
      }
    })();
    return () => { alive = false; };
  }, []); // hanya sekali saat mount


  useEffect(() => {
    try {
      const saved = localStorage.getItem("pm-device-id");
      if (!saved) return;
      const i = LOCS.findIndex((d) => d.device_id === saved);
      if (i >= 0) setSelectedLocation(i);
    } catch {}
  }, [LOCS.length]);

  useEffect(() => {
    if (selectedLocation >= LOCS.length) setSelectedLocation(0);
  }, [LOCS.length, selectedLocation]);

  useEffect(() => {
    try {
      if (activeLoc?.device_id) localStorage.setItem("pm-device-id", activeLoc.device_id);
    } catch {}
  }, [activeLoc?.device_id]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const pickBtnRef = useRef<HTMLButtonElement | null>(null);

  const savedScrollY = useRef(0);
  const savedScrollX = useRef(0);
  const savedScroller = useRef<HTMLElement | null>(null);
  function getScroller(): HTMLElement | null {
    return document.getElementById("pm-scroll");
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return LOCS;
    const q = query.toLowerCase();
    return LOCS.filter(
      (d) =>
        safeLower(d.device_id).includes(q) ||
        safeLower(d.address_name).includes(q) ||
        safeLower(d.detail_location).includes(q)
    );
  }, [query, LOCS]);

  const closePicker = React.useCallback(() => {
    setPickerOpen(false);
    setTimeout(() => pickBtnRef.current?.focus({ preventScroll: true }), 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePicker();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePicker]);

  useEffect(() => {
    if (!pickerOpen) return;

    const scroller = getScroller();
    savedScroller.current = scroller;

    if (scroller) {
      savedScrollY.current = scroller.scrollTop;
      savedScrollX.current = scroller.scrollLeft;
      scroller.style.overflow = "hidden";
    } else {
      savedScrollY.current = window.scrollY;
      savedScrollX.current = window.scrollX;

      (document.body.style as any).position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }

    return () => {
      if (savedScroller.current) {
        const s = savedScroller.current;
        s.style.overflow = "";
        s.scrollTo({
          top: savedScrollY.current,
          left: savedScrollX.current,
          behavior: "auto",
        });
      } else {
        const y = savedScrollY.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo({
          top: y,
          left: savedScrollX.current,
          behavior: "auto",
        });
      }
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const dialog = document.getElementById("pm-device-picker");
    if (!dialog) return;

    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        (last as HTMLElement)?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        (first as HTMLElement)?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  useEffect(() => setHi(0), [query, filtered.length]);

  const refs = useMemo(
    () =>
      Object.fromEntries(
        POWER_SECTIONS.map(({ key }) => [
          key as PowerKey,
          { el: null as HTMLElement | null },
        ])
      ) as Record<PowerKey, { el: HTMLElement | null }>,
    []
  );

  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    if (!root) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const mid = r.top + r.height / 2;

        let bestKey: PowerKey | null = null;
        let bestDist = Infinity;

        for (const { key } of POWER_SECTIONS) {
          const el = refs[key as PowerKey].el;
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const d = Math.abs(center - mid);
          if (d < bestDist) {
            bestDist = d;
            bestKey = key as PowerKey;
          }
        }

        if (bestKey) {
          const newHash = `#${slugify(bestKey)}`;
          if (window.location.hash !== newHash) {
            history.replaceState(null, "", newHash);
          }
          window.dispatchEvent(
            new CustomEvent("pm-section-change", { detail: bestKey })
          );
          try {
            localStorage.setItem("lastPowerSub", bestKey);
          } catch {}
        }

        ticking = false;
      });
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [refs]);

  useEffect(() => {
    const path = window.location.pathname;
    const m = path.match(/\/dashboard\/power-monitoring\/([^/]+)/);
    if (m) history.replaceState(null, "", `/dashboard/power-monitoring#${m[1]}`);
  }, []);

  useEffect(() => {
    const root = document.getElementById("pm-scroll");
    if (root) (root as HTMLElement).style.scrollPaddingTop = `${TOP_OFFSET}px`;
  }, []);

  const getRelativeTop = (root: HTMLElement, target: HTMLElement) => {
    const rRect = root.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    return tRect.top - rRect.top + root.scrollTop;
  };

  useEffect(() => {
    const scrollToHash = (hash?: string) => {
      const h = (hash ?? window.location.hash).replace("#", "");
      if (!h) return;
      const item = POWER_SECTIONS.find((s) => s.id === h);
      if (!item) return;

      const target = refs[item.key as PowerKey].el;
      if (!target) return;

      const root = document.getElementById("pm-scroll") as HTMLElement | null;

      if (root) {
        const relTop = getRelativeTop(root, target);
        const visibleHeight = root.clientHeight;
        const centerTop = relTop - (visibleHeight - target.offsetHeight) / 2;

        root.scrollTo({
          top: Math.max(0, centerTop),
          behavior: "smooth",
        });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    scrollToHash();
    const onHash = () => scrollToHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [refs]);

  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    if (!root) return;

    const visibleHeight = root.clientHeight;
    const topRM = -(visibleHeight / 2);
    const bottomRM = -(visibleHeight / 2);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const key = (visible.target as HTMLElement).dataset
          .key as PowerKey | undefined;
        if (!key) return;

        const newHash = `#${slugify(key)}`;
        if (window.location.hash !== newHash) {
          history.replaceState(null, "", newHash);
        }

        window.dispatchEvent(new CustomEvent("pm-section-change", { detail: key }));
        try {
          localStorage.setItem("lastPowerSub", key);
        } catch {}
      },
      {
        root,
        rootMargin: `${topRM}px 0px ${bottomRM}px 0px`,
        threshold: [0.25, 0.5, 0.75],
      }
    );

    POWER_SECTIONS.forEach(({ key }) => {
      const el = refs[key as PowerKey].el;
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [refs]);

  const headRef = useRef<HTMLElement | null>(null);
  const [showHUD, setShowHUD] = useState(false);

  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    const el = headRef.current;
    if (!el) return;

    const initCheck = () => {
      const rect = el.getBoundingClientRect();
      const vh = root ? root.clientHeight : window.innerHeight;
      const visible = rect.bottom > 0 && rect.top < vh;
      setShowHUD(!visible);
    };
    initCheck();

    const io = new IntersectionObserver(
      ([entry]) => {
        setShowHUD(!entry.isIntersecting || entry.intersectionRatio < 0.05);
      },
      { root, threshold: [0, 0.05, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return {
    LOCS,
    activeLoc,
    selectedLocation,
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

    POWER_SECTIONS,
    slugify,
    getLocationLabel,
  };
}
