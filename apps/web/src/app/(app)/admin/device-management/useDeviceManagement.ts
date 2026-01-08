"use client";

import { useEffect, useMemo, useState, useRef} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_REQ as API_DEVICE_REQ } from "../device-request/constants";

import type { DeviceRow, DataRow, ToastPayload, ToastKind } from "./types";
import {
  GOOGLE_MAPS_KEY,
  PREFILL_KEY,
  type WattageOpt,
  getAuthHeaders,
} from "./constants";
import {
  makeEmptyDevice,
  validateEditDevice,
  validateNewDevice,
} from "./validation";
import {
  fetchDevices,
  createDevice,
  ApiError,
  updateDevice,
  deleteDevice,
} from "./api";

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export default function useDeviceManagement() {
  const [toastEvent, setToastEvent] = useState<ToastPayload>({ type: "info", text: "", id: 0 });
  const toastIdRef = useRef(0);

  const pushToast = (type: ToastKind, text: string) => {
    const id = ++toastIdRef.current;
    setToastEvent({ type, text, id });
  };
  const [tableData, setTableData] = useState<DeviceRow[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useMemo(() => search, [search]);

  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [addDeviceModal, setAddDeviceModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addMode, setAddMode] = useState<"approve" | "create">("create");
  const [prefillReq, setPrefillReq] = useState<{ id: number } | null>(null);

  const [newDevice, setNewDevice] = useState<DataRow>(() => makeEmptyDevice());
  const [errors, setErrors] = useState<
    Partial<Record<keyof DataRow, string>>
  >({});
  const [wattageOpt, setWattageOpt] = useState<WattageOpt>("2000 VA");

  // konfirmasi ubah posisi marker (ADD)
  const [confirmMove, setConfirmMove] = useState<{
    lat: number;
    lng: number;
    type: "click" | "drag";
  } | null>(null);

  // konfirmasi hasil geocode (ADD)
  const [confirmGeocode, setConfirmGeocode] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // konfirmasi pindah marker di EDIT
  const [confirmEditMove, setConfirmEditMove] = useState<{
    lat: number;
    lng: number;
    type: "click" | "drag";
  } | null>(null);

  // confirm delete
  const [confirmDelete, setConfirmDelete] = useState<DataRow | null>(null);

  // edit overlay
  const [editRow, setEditRow] = useState<DataRow | null>(null);

  /* ========== DATA FETCHING ========== */

  // LOAD AWAL
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchDevices();
        if (alive) setTableData(rows);
      } catch (e) {
        console.error("fetch devices (initial) failed:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // SERVER-SIDE SEARCH
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchDevices(debouncedSearch);
        if (alive) setTableData(rows);
      } catch (e) {
        console.error("fetch devices (search) failed:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [debouncedSearch]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, show]);

  /* ========== PREFILL REQUEST DARI LOCAL STORAGE ========== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(PREFILL_KEY);
    if (!stored) {
      setPrefillReq(null);
      setAddMode("create");
      return;
    }

    try {
      const req = JSON.parse(stored) as {
        id?: number;
        username?: string;
        address?: string;
        detail_address?: string;
        lat?: number;
        lng?: number;
        segmen?: string;
      };

      if (req?.id) setPrefillReq({ id: req.id });
      setAddMode("approve");

      setNewDevice((prev) => ({
        ...prev,
        username: req.username || "",
        address_name: req.address || "",
        detail_address_name: req.detail_address || "",
        lat:
          typeof req.lat === "number"
            ? req.lat
            : Number.NaN,
        long:
          typeof req.lng === "number"
            ? req.lng
            : Number.NaN,
        segment: req.segmen || "",
        active: "YES",
      }));

      setWattageOpt("2000 VA");
      setAddDeviceModal(true);
      pushToast("success","Prefilled request data loaded successfully!");
    } catch (err) {
      console.error("Failed to parse prefillDeviceData:", err);
      setPrefillReq(null);
      setAddMode("create");
    }
  }, []);

  /* ========== AUTO-GEOCODE ALAMAT ========== */

  useEffect(() => {
    if (
      newDevice.address_name &&
      newDevice.detail_address_name &&
      (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long))
    ) {
      const timer = setTimeout(() => {
        geocodeAddress();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [newDevice.address_name, newDevice.detail_address_name]);

  /* ========== FILTER & PAGINATION ========== */

  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();
    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.serial_number,
        d.username,
        d.wattage,
        d.phase,
        d.address_name,
        d.detail_address_name,
        d.long,
        d.lat,
        d.segment,
        d.active,
      ]
        .join(" ")
        .toLowerCase();

      return combined.includes(lowerSearch);
    });
  }, [tableData, debouncedSearch]);

  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  /* ========== EXPORT EXCEL ========== */

  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Device Management");

    worksheet.columns = [
      { header: "Serial Number", key: "serial_number", width: 15 },
      { header: "Owner", key: "username", width: 20 },
      { header: "Wattage", key: "wattage", width: 12 },
      { header: "Phase", key: "phase", width: 12 },
      { header: "Address Name", key: "address_name", width: 20 },
      { header: "Detail Address", key: "detail_address_name", width: 20 },
      { header: "Lat", key: "lat", width: 12 },
      { header: "Long", key: "long", width: 12 },
      { header: "Segment", key: "segment", width: 15 },
      { header: "Active", key: "active", width: 10 },
    ];

    filteredData.forEach((item) => worksheet.addRow(item));

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E2A4A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Device_Management.xlsx");
  };

  /* ========== DELETE DEVICE ========== */

  const handleDelete = async (row: DataRow) => {
    try {
      await deleteDevice(row.id);
      setTableData((prev) => prev.filter((item) => item.id !== row.id));
      pushToast("success"," Device deleted");
    } catch (e) {
      console.error(e);
      pushToast("error"," Failed to deleted");
    } finally {
      setConfirmDelete(null);
    }
  };

  /* ========== SAVE EDIT ========== */

  const handleSaveEdit = async () => {
    if (!editRow) return;

    const newErrors = validateEditDevice(editRow);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        address_name: editRow.address_name,
        detail_address_name: editRow.detail_address_name,
        lat: Number(editRow.lat),
        long: Number(editRow.long),
        segment: editRow.segment,
      };

      const updated = await updateDevice(editRow.id, payload);

      setTableData((prev) =>
        prev.map((it) => (it.id === editRow.id ? updated : it))
      );

      pushToast("success"," Device updated successfully!");
      setEditRow(null);
      setErrors({});
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409 && e.code === "COORD_EXISTS") {
          setErrors((x) => ({
            ...x,
            lat: "Lat & Long sudah digunakan",
            long: "Lat & Long sudah digunakan",
          }));
          return;
        }
        if (e.status === 404) {
          pushToast("error"," Device not found (Maybe already delete)");
          return;
        }
      }
      console.error(e);
      pushToast("error"," Failed to update device!");
    }
  };

  /* ========== ADD DEVICE ========== */

  const handleAddDevice = async () => {
    const newErrors = validateNewDevice(newDevice);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      serial_number: newDevice.serial_number.trim(),
      username: newDevice.username.trim(),
      address_name: newDevice.address_name.trim(),
      detail_address_name: newDevice.detail_address_name?.trim() || undefined,
      lat: Number(newDevice.lat),
      long: Number(newDevice.long),
      segment: newDevice.segment.trim(),
      wattage: wattageOpt,
    };

    try {
      if (addMode === "approve" && prefillReq?.id) {
        const res = await fetch(API_DEVICE_REQ, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            id: prefillReq.id,
            status: "approved",
            wattage: wattageOpt,
          }),
        });

      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
      }

        // bersihin prefill kalau approve
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(PREFILL_KEY);
          } catch {
            // ignore
          }
        }

        pushToast("success"," Request approved & device provisioned!");
      } else {
        const created = await createDevice(payload);
        setTableData((prev) => [created, ...prev]);
        pushToast("success"," Device created!");
      }

      // reset modal & state
      setAddMode("create");
      setPrefillReq(null);
      setAddDeviceModal(false);
      setErrors({});
      setNewDevice(makeEmptyDevice());
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.status === 409 && e.code === "SERIAL_EXISTS") {
          setErrors((x) => ({
            ...x,
            serial_number: "Serial number sudah dipakai",
          }));
        } else if (e.status === 409 && e.code === "COORD_EXISTS") {
          setErrors((x) => ({
            ...x,
            lat: "Lat & Long sudah digunakan",
            long: "Lat & Long sudah digunakan",
          }));
        } else if (e.status === 400 && e.code === "OWNER_NOT_FOUND") {
          setErrors((x) => ({
            ...x,
            username: "Username owner tidak ditemukan",
          }));
        } else {
          pushToast("error"," Failed to add device!");
        }
      } else {
        pushToast("error"," Operation failed.");
      }
    }
  };

  /* ========== GEOCODING ========== */

  const geocodeAddress = async () => {
    const address = `${newDevice.address_name}, Indonesia`.trim();
    if (!newDevice.address_name) {
      pushToast("danger"," Please fill in Address Name first!");
      return;
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;

        if (!Number.isNaN(newDevice.lat) && !Number.isNaN(newDevice.long)) {
          setConfirmGeocode({ lat, lng });
        } else {
          setNewDevice((prev) => ({ ...prev, lat, long: lng }));
          pushToast("success"," Location found and set for the first time!");
        }
      } else {
        pushToast("error"," Address not found. Try refining the address text (e.g., add city).");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      pushToast("error"," Failed to fetch geolocation.");
    }
  };

  /* ========== HELPER UNTUK MODAL ========== */

  const cancelAddModal = () => {
    setAddDeviceModal(false);
    setAddMode("create");
    setPrefillReq(null);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(PREFILL_KEY);
      } catch {
        // ignore
      }
    }

    setNewDevice(makeEmptyDevice());
    setErrors({});
  };

  const applyConfirmMove = () => {
    if (!confirmMove) return;
    setNewDevice((prev) => ({
      ...prev,
      lat: confirmMove.lat,
      long: confirmMove.lng,
    }));
    setConfirmMove(null);
    pushToast("success"," Device location updated successfully!");
  };

  const applyConfirmGeocode = () => {
    if (!confirmGeocode) return;
    setNewDevice((prev) => ({
      ...prev,
      lat: confirmGeocode.lat,
      long: confirmGeocode.lng,
    }));
    setConfirmGeocode(null);
    pushToast("success"," Device location updated from address!");
  };

  const applyConfirmEditMove = () => {
    if (!confirmEditMove) return;
    setEditRow((prev) =>
      prev
        ? {
            ...prev,
            lat: confirmEditMove.lat,
            long: confirmEditMove.lng,
          }
        : prev
    );
    setConfirmEditMove(null);
     pushToast("success"," Device location updated successfully!");
  };

  return {
    // state
    tableData,
    search,
    setSearch,
    debouncedSearch,
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

    // actions
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
  };
}
