"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { API_REQ, POLL_INTERVAL_MS } from "./constants";
import { safeParseRequests, filterRequests } from "./validation";
import type { Request, Status } from "./types";

export type RequestAction = Extract<Status, "approved" | "rejected">;
export type HandleAction = (id: number, status: RequestAction, device_id?: string) => Promise<void>;

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export function useDeviceRequests() {
  const [tableData, setTableData] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<number | null>(null);
  const inflightRef = useRef<AbortController | null>(null);

  async function fetchRequestsOnce(signal?: AbortSignal) {
    setErrMsg(null);
    try {
      const res = await fetch(API_REQ, { cache: "no-store", signal, credentials: "include" });
      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
      }
      const text = await res.text();
      const parsed = safeParseRequests(text);
      const sorted = parsed.sort((a, b) => b.id - a.id);
      setTableData(sorted);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("fetchRequests error:", e);
      setErrMsg("Gagal memuat data request. Cek server /api/device-request.");
    }
  }

  const startPolling = () => {
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    pollTimerRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        inflightRef.current?.abort();
        const c = new AbortController();
        inflightRef.current = c;
        fetchRequestsOnce(c.signal);
      }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const c = new AbortController();
    inflightRef.current = c;
    fetchRequestsOnce(c.signal);
    startPolling();

    const onVis = () => {
      if (document.visibilityState === "visible") {
        inflightRef.current?.abort();
        const c2 = new AbortController();
        inflightRef.current = c2;
        fetchRequestsOnce(c2.signal);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      inflightRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, show]);

  const filteredData = useMemo(
    () => filterRequests(tableData, debouncedSearch),
    [tableData, debouncedSearch]
  );

  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.max(1, Math.ceil(filteredData.length / show));

  // helper nomor urut (bukan id)
  const rowNumber = (indexInPage: number) =>
    show === -1 ? indexInPage + 1 : (currentPage - 1) * show + indexInPage + 1;

   const handleAction: HandleAction = async (id, status, device_id) => {
    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch(API_REQ, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, device_id }),
        credentials: "include",
      });
      if (!res.ok) {
        console.warn(
            "[fetchMyDevices] not ok:",
            res.status,
            res.statusText
          );
      }
      await fetchRequestsOnce(); // refresh tabel
    } catch (e: any) {
      console.error("handleAction error:", e);
      setErrMsg("Aksi gagal. Cek route PATCH di backend.");
    } finally {
      setLoading(false);
    }
  };

  return {
    // data
    tableData,
    filteredData,
    paginatedData,
    totalPages,

    // ui state
    search,
    setSearch,
    debouncedSearch,
    show,
    setShow,
    currentPage,
    setCurrentPage,
    loading,
    errMsg,

    // actions
    handleAction,
    rowNumber,
  };
}
