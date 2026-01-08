// apps/web/src/app/(reports)/energy-usage/useEnergyUsageReport.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { authHeaders } from "../api";
import { API_REPORT_ENERGY } from "./constants";
import type { Row } from "./types";

const REFRESH_MS = 15000; // auto refresh 15 detik

type EnergyReportResponse = {
  total: number;
  rows: {
    serial: number;
    date: string;
    data_id: number | string;
    start_kwh: number | string;
    end_kwh: number | string;
    usage_kwh: number | string;
    usage_cost_kwh: number | string;
    usage_cost_per_day: number | string;
  }[];
};

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  

export default function useEnergyUsageReport() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // default: hari ini untuk range
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [dateTo, setDateTo] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  // "" = All Locations
  const [selectedLocation, setSelectedLocation] = useState("");

  const [data, setData] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [refreshTick, setRefreshTick] = useState(0);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page kalau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo, show, selectedLocation]);

  // ⏱️ timer auto-refresh (All & single location)
  useEffect(() => {
    if (!dateFrom || !dateTo) return;

    const id = setInterval(() => {
      setRefreshTick((n) => n + 1);
    }, REFRESH_MS);

    return () => clearInterval(id);
  }, [selectedLocation, dateFrom, dateTo]);

  // fetch data dari BE
  useEffect(() => {
    if (!dateFrom || !dateTo || !selectedLocation) {
      setData([]);
      setTotalRows(0);
      return;
    }

    // ✅ kirim sebagai ISO lokal (tanpa timezone)
    const from = `${dateFrom}T00:00:00`;
    const to   = `${dateTo}T23:59:59`;

    const params = new URLSearchParams();
    params.set("from", from);
    params.set("to", to);

    params.set("deviceId", selectedLocation);

    const url = `${API_REPORT_ENERGY}?${params.toString()}`;

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

        const json: EnergyReportResponse = JSON.parse(text);

        const mapped: Row[] = (json.rows ?? []).map((row: any) => ({
          id: Number(row.serial),
          data_id: row.data_id ?? "",
          date: row.date,
          start_kwh: Number(row.start_kwh),
          end_kwh: Number(row.end_kwh),
          usage_kwh: Number(row.usage_kwh),
          usage_cost_kwh: Number(row.usage_cost_kwh),
          usage_cost_per_day: Number(row.usage_cost_per_day),
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
  }, [selectedLocation, dateFrom, dateTo, refreshTick]);

  // filter by search (optional; sekarang cuma by id/date/time)
  const filteredData: Row[] = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return data;

    return data.filter((d) => {
      return (
        d.id.toString().includes(keyword) ||
        d.data_id.toString().toLowerCase().includes(keyword) ||
        d.date.toLowerCase().includes(keyword)
      );
    });
  }, [data, debouncedSearch]);

  // pagination
  const paginatedData: Row[] = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.usage_kwh += Number(item.usage_kwh) || 0;
        acc.usage_cost_per_day += Number(item.usage_cost_per_day) || 0;
        return acc;
      },
      { usage_kwh: 0, usage_cost_per_day: 0 },
    );
  }, [filteredData]);

  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Energy Report");

    worksheet.columns = [
      { header: "Data ID", key: "data_id", width: 12 },
      { header: "Date", key: "date", width: 15 },
      { header: "Start KWH", key: "start_kwh", width: 18 },
      { header: "End KWH", key: "end_kwh", width: 18 },
      { header: "Usage KWH", key: "usage_kwh", width: 18 },
      { header: "Usage Cost KWH", key: "usage_cost_kwh", width: 20 },
      { header: "Usage Cost / Day (IDR)", key: "usage_cost_per_day", width: 24 },
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

    saveAs(blob, "Energy_Report.xlsx");
  };

  return {
    // search (kalau nanti mau dipakai di UI)
    search,
    setSearch,
    debouncedSearch,

    show,
    setShow,
    currentPage,
    setCurrentPage,

    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,

    selectedLocation,
    setSelectedLocation,

    paginatedData,
    totalPages,
    totals,
    exportXLS,
  };
}
