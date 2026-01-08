"use client";

import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { SummaryRow, SummaryReportResponse } from "./types";
import { authHeaders } from "../api";
import { API_REPORT_SUMMARY } from "./constants";

const REFRESH_MS = 15000; // 15 detik

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  

export default function useSummaryReport() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // default: hari ini (YYYY-MM-DD)
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  // "" = All Locations
  const [selectedLocation, setSelectedLocation] = useState("");

  const [data, setData] = useState<SummaryRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [refreshTick, setRefreshTick] = useState(0);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page setiap filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // ⏱️ TIMER auto-refresh → jalan untuk single location & All Locations
  useEffect(() => {
    if (!filterDate) return; // wajib ada tanggal, lokasi boleh kosong (All)

    const id = setInterval(() => {
      setRefreshTick((n) => n + 1);
    }, REFRESH_MS);

    return () => clearInterval(id);
  }, [selectedLocation, filterDate, timeFrom, timeTo]);

  // fetch data summary
  useEffect(() => {
    // ❗ sekarang cuma wajib ada tanggal
    if (!filterDate) {
      setData([]);
      setTotalRows(0);
      return;
    }

    const from = `${filterDate}T${timeFrom}`;
    const to   = `${filterDate}T${timeTo}`;

    const params = new URLSearchParams();
    params.set("from", from);
    params.set("to", to);

    if (selectedLocation) {
      params.set("deviceId", selectedLocation);
    }

    const url = `${API_REPORT_SUMMARY}?${params.toString()}`;

    const load = async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 204 || res.status === 404) {
          setData([]);
          setTotalRows(0);
          return;
        }

        if (res.status === 401) {
          console.warn("[SiteMonitoring] 401 – redirecting to /login");
          redirectToLoginFromClient();
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`${res.status} ${res.statusText} ${txt}`);
        }

        const text = await res.text().catch(() => "");
        if (!text || !text.trim()) {
          setData([]);
          setTotalRows(0);
          return;
        }

        const json: SummaryReportResponse = JSON.parse(text);

        const mapped: SummaryRow[] = (json.rows ?? []).map((row: any) => ({
          id: Number(row.serial),
          dataId: Number(row.serial),
          date: row.date,
          time: row.time,
          voltage: Number(row.voltage),
          current: Number(row.current),
          frequency: Number(row.frequency),
          cos: Number(row.cos_phi),
          power: Number(row.power),
          address_name: row.address_name,
          detail_address_name: row.detail_address_name,
        }));

        setData(mapped);
        setTotalRows(Number(json.total ?? mapped.length));
      } catch (err) {
        console.error(err);
        setData([]);
        setTotalRows(0);
      }
    };

    load();
  }, [selectedLocation, filterDate, timeFrom, timeTo, refreshTick]);

  // filter data by search
  const filteredData: SummaryRow[] = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((d) => {
      return (
        d.id.toString().includes(keyword) ||
        d.address_name?.toLowerCase().includes(keyword) ||
        d.detail_address_name?.toLowerCase().includes(keyword)
      );
    });
  }, [data, debouncedSearch]);

  // pagination
  const paginatedData: SummaryRow[] = useMemo(() => {
    if (show === -1) return filteredData; // -1 = ALL
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("PQ Report");

    worksheet.columns = [
      { header: "Data ID", key: "id", width: 12 },
      { header: "Date", key: "date", width: 12 },
      { header: "Time", key: "time", width: 12 },
      { header: "Voltage (V)", key: "voltage", width: 14 },
      { header: "Current (A)", key: "current", width: 14 },
      { header: "Frequency (Hz)", key: "frequency", width: 16 },
      { header: "Cos (φ)", key: "cos", width: 10 },
      { header: "Power (W)", key: "power", width: 12 },
    ];

    filteredData.forEach((item) => worksheet.addRow(item));

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E2A4A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.autoFilter = { from: "A1", to: "H1" };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "PQ_Report.xlsx"
    );
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    show,
    setShow,
    currentPage,
    setCurrentPage,
    filterDate,
    setFilterDate,
    timeFrom,
    setTimeFrom,
    timeTo,
    setTimeTo,
    selectedLocation,
    setSelectedLocation,
    paginatedData,
    totalPages,
    exportXLS,
  };
}
