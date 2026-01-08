// useListCostEnergy.ts
"use client";

import { useEffect, useMemo, useState, type FormEvent, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { initialData, API_BASE } from "./constants";
import type { DataRow, ToastKind, ToastPayload } from "./types";
import { parsePowerPhase, validateCostForm } from "./validation";
const COSTS_API = `${API_BASE}/costs` as const;

const parsePowerPhaseFromText = (text: string) => {
  const t = String(text || "");
  const right = t.includes("—") ? t.split("—").pop()!.trim() : t.trim();
  const m = right.match(/([\d.]+)\s*(k?va|watt|w|va)?/i);
  const power = m ? Math.round(parseFloat(m[1]) * (m[2]?.toLowerCase().startsWith("k") ? 1000 : 1)) : 0;
  const phase = /3\s*ph|3\s*phase|3ph/i.test(right) ? "3 Phase" : "1 Phase";
  return { power, phase };
};

// ubah ISO UTC -> lokal "YYYY-MM-DD" + "HH:mm:ss"
const pad = (n: number) => String(n).padStart(2, "0");

const toLocalParts = (iso?: string) => {
  if (!iso) return { date: "", time: "", human: "" };
  const d = new Date(iso); // otomatis ke time zone browser (Asia/Jakarta)
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return { date, time, human: `${date} ${time}` };
};

export default function useListCostEnergy() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>(initialData);

  // form state
  const [newPower, setNewPower] = useState<string>("");
  const [newCost, setNewCost] = useState<string>("");
  const [newValidFrom, setNewValidFrom] = useState<string>("");
  const [newValidUntil, setNewValidUntil] = useState<string>("");
  const [keyToCostId, setKeyToCostId] = useState<Record<string, number>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [toastEvent, setToastEvent] = useState<ToastPayload>({
    type: "info",
    text: "",
    id: 0,
  });

  const toastIdRef = useRef(0);

  const pushToast = (type: ToastKind, text: string) => {
    const id = ++toastIdRef.current;
    setToastEvent({ type, text, id });
  };

  // + Ambil history & options dari BE saat mount
  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        // 4a) Ambil HISTORY (tarik banyak biar filter/pagination tetap di FE)
        const histRes = await fetch(`${COSTS_API}/history?page=1&pageSize=5000`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const histJson = await histRes.json().catch(() => ({} as any));
        const rows = Array.isArray(histJson?.rows) ? histJson.rows : [];

        // mapping BE -> FE
      const mapped: DataRow[] = rows.map((r: any, idx: number) => {
        const { power, phase } = parsePowerPhaseFromText(`${r.tariff_group} — ${r.power_limit}`);

        const vf = String(r.valid_from ?? r.validFrom ?? "");
        const vt = r.valid_to ?? r.validTo ?? null;

        const vfParts = toLocalParts(vf);
        const vtParts = vt ? toLocalParts(String(vt)) : { date: "", time: "", human: "" };

        return {
          id: `${r.cost_id ?? r.costId}-${r.history_id ?? idx}`,
          // ⬇⬇ dipakai oleh filter UI
          date: vfParts.date,              // YYYY-MM-DD lokal
          time: vfParts.time,              // HH:mm:ss lokal

          // kolom tabel
          power,
          phase,
          cost: Number(r.cost_value ?? r.costValue ?? 0),

          // kolom VALID FROM/UNTIL yang ditampilkan
          validFrom: vfParts.human,        // "YYYY-MM-DD HH:mm:ss"
          validUntil: vtParts.human,       // "" kalau null
        } as DataRow;
      });


        // 4b) Ambil OPTIONS untuk mapping "power/phase" -> costId (robust)
        const optRes = await fetch(`${COSTS_API}/options`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        let optionsRaw: any = null;
        try { optionsRaw = await optRes.json(); } catch { optionsRaw = null; }

        // normalisasikan: dukung bentuk {rows:[]}, {data:[]}, array langsung, atau object campur
        let optionsArr: any[] = [];
        if (Array.isArray(optionsRaw)) {
          optionsArr = optionsRaw;
        } else if (Array.isArray(optionsRaw?.rows)) {
          optionsArr = optionsRaw.rows;
        } else if (Array.isArray(optionsRaw?.data)) {
          optionsArr = optionsRaw.data;
        } else if (optionsRaw && typeof optionsRaw === "object") {
          // ambil semua array yang ada di value object
          for (const v of Object.values(optionsRaw)) {
            if (Array.isArray(v)) optionsArr = optionsArr.concat(v as any[]);
          }
        }

        const mapKey: Record<string, number> = {};

        // 1) coba bangun mapping dari OPTIONS (jika ada)
        for (const o of optionsArr) {
          const label =
            o?.label ??
            o?.name ??
            `${o?.tariff_group ?? ""} — ${o?.power_limit ?? ""}`.trim();

          const { power, phase } = parsePowerPhaseFromText(label);
          const id = Number(o?.costId ?? o?.cost_id ?? o?.id);
          if (!Number.isNaN(id) && power > 0 && phase) {
            mapKey[`${power} / ${phase}`] = id;
          }
        }

        // 2) fallback: kalau OPTIONS kosong/format tak dikenal,
        //    pakai data dari HISTORY (punya cost_id) untuk bikin mapping
        if (!Object.keys(mapKey).length && Array.isArray(rows)) {
          for (const r of rows) {
            const label = `${r?.tariff_group ?? ""} — ${r?.power_limit ?? ""}`;
            const { power, phase } = parsePowerPhaseFromText(label);
            const id = Number(r?.cost_id ?? r?.costId);
            if (!Number.isNaN(id) && power > 0 && phase) {
              mapKey[`${power} / ${phase}`] = id;
            }
          }
        }

        if (!aborted) {
          // ⬇️ timpa dummy dengan data dari BE
          setTableData(mapped.length ? mapped : []);
          setKeyToCostId(mapKey);
        }

      } catch (e) {
        console.error("load costs failed:", e);
      }
    })();

    return () => { aborted = true; };
  }, []);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // filter data
  const filteredData = useMemo(() => {
    return tableData.filter(
      (d) =>
        `${d.power} / ${d.phase}`.includes(debouncedSearch) &&
        (!filterDate || d.date === filterDate) &&
        (!timeFrom || d.time >= timeFrom) &&
        (!timeTo || d.time <= timeTo)
    );
  }, [debouncedSearch, filterDate, timeFrom, timeTo, tableData]);

  // pagination
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.max(1, Math.ceil(filteredData.length / show));

  // export Excel (identik)
  const exportXLS = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("List Cost Energy");

      worksheet.columns = [
        { header: "Wattage/Phase", key: "powerPhase", width: 20 },
        { header: "Cost (Rupiah)", key: "cost", width: 15 },
        { header: "valid from", key: "validFrom", width: 20 },
        { header: "valid until", key: "validUntil", width: 20 },
      ];

      filteredData.forEach((item) =>
        worksheet.addRow({
          powerPhase: `${item.power} / ${item.phase}`,
          cost: item.cost,
          validFrom: item.validFrom,
          validUntil: item.validUntil,
        })
      );

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E2A4A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "List_Cost_Energy.xlsx");
    } catch (err) {
      console.error("export error:", err);
      pushToast("error", "Failed to export Excel")
    }
  };

  // submit add data (identik)
  const handleAddNewData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    setFormErrors({});

    const errors = validateCostForm({
      powerLabel: newPower,
      cost: String(newCost ?? ""),
      validFrom: newValidFrom,
      validUntil: newValidUntil,
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      pushToast("error", "Please fix the highlighted fields.");
      return;
    }
    const parsed = parsePowerPhase(newPower)!;
    const costNum = Number(newCost);
    if (!parsed || Number.isNaN(costNum)) { pushToast(errors, "Wattage or Cost invalid"); return; }
    if (!newValidFrom) { pushToast(errors, "Fill Valid From"); return; }

    // cari costId dari pilihan "900 / 1 Phase"
    const costId = keyToCostId[newPower];
    if (!costId) { pushToast(errors, "CostId not Found"); return; }

    // siapkan payload BE (BE hanya butuh dateFrom; validUntil dikelola otomatis)
    const body = {
      costId,
      costValue: costNum,
      dateFrom: newValidFrom.split("T")[0], // BE pakai tanggal (yyyy-mm-dd)
    };

    setSubmitting(true);

    try {
      const res = await fetch(`${COSTS_API}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan harga");

      // Tambahkan ke tabel lokal agar langsung terlihat
      const newEntry: DataRow = {
        id: `${costId}-${data?.history_id ?? Date.now()}`,
        date: body.dateFrom,
        time: "00:00:00",
        voltage: 0,
        current: 0,
        frequency: 0,
        cos: 1,
        power: parsed.power,
        phase: parsed.phase,
        cost: costNum,
        validFrom: body.dateFrom,
        validUntil: "", // harga baru masih open (valid_to = null)
      };

      setTableData((prev) => [newEntry, ...prev]);
      setShowAddModal(false);
      setNewPower("");
      setNewCost("");
      setNewValidFrom("");
      setNewValidUntil("");
      setFormErrors({});
      pushToast("success", "Cost configuration updated successfully!");
    } catch (err: any) {
      console.error(err);
      const msg = "Failed to update cost configuration.";
      setApiError(msg);
      pushToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };


  return {
    // state & setter buat control
    search, setSearch,
    debouncedSearch,
    show, setShow,
    currentPage, setCurrentPage,
    filterDate, setFilterDate,
    timeFrom, setTimeFrom,
    timeTo, setTimeTo,
    showAddModal, setShowAddModal,
    tableData, setTableData,

    // form add
    newPower, setNewPower,
    newCost, setNewCost,
    newValidFrom, setNewValidFrom,
    newValidUntil, setNewValidUntil,

    // data terolah
    filteredData,
    paginatedData,
    totalPages,

    // actions
    exportXLS,
    handleAddNewData,
    
    formErrors,
    apiError,
    toastEvent,
    submitting,
  };
}
