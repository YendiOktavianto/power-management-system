// app/(app)/dashboard/user-info/add-device/useAddDevice.ts
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { API_REQ } from "./constants";
import type { DataItem, Request, Option } from "./types";
import { validateAddDevice } from "./validation";
import type { ToastPayload, ToastKind } from "./types";

export default function useAddDevice() {
  const [allData, setAllData] = useState<DataItem[]>([]);
  const [form, setForm] = useState({
    street_name: "",
    province_id: "",
    city_id: "",
    district_id: "",
    subdistrict_id: "",
    postal_code: "",
    segmen: "",
    detail_address: "",
    lat: -6.1751,
    lng: 106.865,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [markerEdited, setMarkerEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Request[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [zoom, setZoom] = useState(9);

  // Delete overlay
  const [showOverlayDelete, setShowOverlayDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Request | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Confirm & warning overlays
  const [showOverlayConfirm, setShowOverlayConfirm] = useState(false);
  const [showOverlayWarning, setShowOverlayWarning] = useState(false);

  const [toastEvent, setToastEvent] = useState<ToastPayload>({ type: "info", text: "", id: 0 });
  const toastIdRef = useRef(0);

  const pushToast = (type: ToastKind, text: string) => {
    const id = ++toastIdRef.current; 
    setToastEvent({ type, text, id });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/data.json");
        const contentType = res.headers.get("content-type") || "";

        if (!res.ok || !contentType.includes("application/json")) {
          const text = await res.text().catch(() => "");
          console.warn(
            "[useAddDevice] Unexpected response for /data/data.json:",
            res.status,
            res.statusText,
            text.slice(0, 200)
          );
          return; // jangan panggil res.json()
        }

        const json = await res.json();
        if (Array.isArray(json)) {
          setAllData(json);
        } else {
          console.warn("[useAddDevice] data.json is not an array");
        }
      } catch (err) {
        console.error("[useAddDevice] failed to load data.json:", err);
      }
    };

    load();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(API_REQ, { method: "GET", credentials: "include" });
      const arr = await res.json();
      const list: Request[] = Array.isArray(arr) ? arr : [];
      list.sort((a, b) => (b.time || 0) - (a.time || 0));
      setHistory(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Helpers
  const getProvinceBoundingCenter = (all: DataItem[], provinceName: string) => {
    const items = all.filter((d) => d.province === provinceName);
    if (items.length === 0) return null;
    const minLat = Math.min(...items.map((d) => d.latitude));
    const maxLat = Math.max(...items.map((d) => d.latitude));
    const minLng = Math.min(...items.map((d) => d.longitude));
    const maxLng = Math.max(...items.map((d) => d.longitude));
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  };

  const fmtTime = (ts: number) => {
    const ms = ts < 1e12 ? ts * 1000 : ts;
    const d = new Date(ms);
    return d.toLocaleString("id-ID");
  };

  const shortText = (s: string, n = 80) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);

  const statusBadgeClass = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") return "bg-green-600/30 text-green-300 border-green-600/50";
    if (s === "REJECTED") return "bg-red-600/30 text-red-300 border-red-600/50";
    return "bg-yellow-600/30 text-yellow-300 border-yellow-600/50";
  };

  // Derived lists
  const provinces = useMemo(
    () => Array.from(new Map(allData.map((d) => [d.province, d])).values()).map((d) => ({ name: d.province })),
    [allData]
  );

  const cities = useMemo(
    () =>
      form.province_id
        ? Array.from(new Map(allData.filter((d) => d.province === form.province_id).map((d) => [d.city, d])).values()).map(
            (d) => ({ name: d.city, lat: d.latitude, lng: d.longitude, postal: d.postal })
          )
        : [],
    [allData, form.province_id]
  );

  const districts = useMemo(
    () =>
      form.city_id
        ? Array.from(new Map(allData.filter((d) => d.city === form.city_id).map((d) => [d.district, d])).values()).map(
            (d) => ({ name: d.district, lat: d.latitude, lng: d.longitude, postal: d.postal })
          )
        : [],
    [allData, form.city_id]
  );

  const subdistricts = useMemo(
    () =>
      form.district_id
        ? allData
            .filter((d) => d.district === form.district_id)
            .map((v) => ({ code: v.code, name: v.village, lat: v.latitude, lng: v.longitude, postal: v.postal }))
        : [],
    [allData, form.district_id]
  );

  // Combobox options
  const provinceOptions: Option[] = useMemo(
    () => provinces.map((p) => ({ label: p.name, value: p.name })),
    [provinces]
  );

  const cityOptions: Option[] = useMemo(
    () =>
      form.province_id
        ? cities.map((k) => ({ label: k.name, value: k.name, lat: k.lat, lng: k.lng, postal: k.postal }))
        : [],
    [cities, form.province_id]
  );

  const districtOptions: Option[] = useMemo(
    () =>
      form.city_id
        ? districts.map((k) => ({ label: k.name, value: k.name, lat: k.lat, lng: k.lng, postal: k.postal }))
        : [],
    [districts, form.city_id]
  );

  const subdistrictOptions: Option[] = useMemo(
    () =>
      form.district_id
        ? subdistricts.map((k) => ({ label: k.name, value: k.name, lat: k.lat, lng: k.lng, postal: k.postal, code: k.code }))
        : [],
    [subdistricts, form.district_id]
  );

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectProvince = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      province_id: value,
      city_id: "",
      district_id: "",
      subdistrict_id: "",
      postal_code: "",
    }));
    setErrors((prev) => ({ ...prev, province_id: "" }));

    if (value) {
      const center = getProvinceBoundingCenter(allData, value);
      if (center) {
        setForm((prev) => ({ ...prev, lat: center.lat, lng: center.lng }));
        setZoom(7);
        setMarkerEdited(false);
      }
    }
  };

  const selectCity = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      city_id: value,
      district_id: "",
      subdistrict_id: "",
      postal_code: opt?.postal ? String(opt.postal) : "",
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, city_id: "" }));
    if (value) {
      setZoom(12);
      setMarkerEdited(false);
    }
  };

  const selectDistrict = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      district_id: value,
      subdistrict_id: "",
      postal_code: opt?.postal ? String(opt.postal) : "",
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, district_id: "" }));
    if (value) {
      setZoom(14);
      setMarkerEdited(false);
    }
  };

  const selectSubdistrict = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      subdistrict_id: value,
      postal_code: opt?.postal ? String(opt.postal) : prev.postal_code,
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, subdistrict_id: "" }));
    if (value) {
      setZoom(15);
      setMarkerEdited(false);
    }
  };

  const handleSubmit = () => {
    const { isValid, errors } = validateAddDevice(form);
    setErrors(errors);
    if (!isValid) return;
    if (!markerEdited) {
      setShowOverlayWarning(true);
      return;
    }
    setShowOverlayConfirm(true);
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      const address = `${form.street_name}, ${form.subdistrict_id}, ${form.district_id}, ${form.city_id}, ${form.province_id}, ${form.postal_code}`;
      const payload = {
        address,
        segmen: form.segmen,
        detail_address: form.detail_address,
        lat: Number(form.lat),
        lng: Number(form.lng),
      };

      const res = await fetch(API_REQ, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Failed to submit request (${res.status}) ${msg}`);
      }
      const saved: Request = await res.json();

      setHistory((prev) => {
        const next = [saved, ...prev];
        next.sort((a, b) => (b.time || 0) - (a.time || 0));
        return next;
      });

      setForm((prev) => ({
        street_name: "",
        province_id: "",
        city_id: "",
        district_id: "",
        subdistrict_id: "",
        postal_code: "",
        segmen: "",
        detail_address: "",
        lat: prev.lat,
        lng: prev.lng,
      }));
      setMarkerEdited(false);
      pushToast("success","Request submitted successfully!");
    } catch (err) {
      console.error(err);
      pushToast("error","Failed to submit request");
    } finally {
      setLoading(false);
      setShowOverlayConfirm(false);
    }
  };

  const doDelete = async (req: Request) => {
    setDeletingId(req.id);
    try {
      let res = await fetch(`${API_REQ}/${req.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        res = await fetch(API_REQ, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: req.id }),
          credentials: "include",
        });
      }
      if (!res.ok) throw new Error("Failed");
      setHistory((prev) => prev.filter((r) => r.id !== req.id));
      pushToast("success","Success to deleted");
    } catch (e) {
      console.error(e);
      pushToast("error","Failed to delete");
    } finally {
      setDeletingId(null);
      setShowOverlayDelete(false);
      setDeleteTarget(null);
    }
  };

  return {
    allData, form, setForm, errors, setErrors,
    markerEdited, setMarkerEdited,
    loading, setLoading,
    history,
    zoom, setZoom,
    loadingHistory,
    showOverlayDelete, setShowOverlayDelete,
    deleteTarget, setDeleteTarget,
    deletingId,
    showOverlayConfirm, setShowOverlayConfirm,
    showOverlayWarning, setShowOverlayWarning,
    provinceOptions, cityOptions, districtOptions, subdistrictOptions,
    selectProvince, selectCity, selectDistrict, selectSubdistrict,
    handleChange, handleSubmit, doSubmit, doDelete, fetchHistory,
    fmtTime, shortText, statusBadgeClass,
    toastEvent,
  };
}
