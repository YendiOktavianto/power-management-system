"use client";

import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_BASE, ADMIN_API_BASE, getAuthHeaders, initialTableData } from "./constants";
import { validateNewUser } from "./validation";
import type { DataRow, EditDraft, NewUserPayload } from "./types";

const ADMIN_USERS_API = `${ADMIN_API_BASE}/users` as const;

const toRow = (r: any) => ({
  id: r.id,
  username: r.username,
  email: r.email,
  phone_number: r.phone_number ?? r.numberPhone ?? "",
  password: "",              // amankan di FE
  confirmPassword: "",
  role: String(r.role ?? "").toLowerCase(),           // USER -> user
  total_device: r.totalDevices ?? r.total_device ?? 0,
  created_at: r.createdAt
    ? new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19)
    : "",
});

const toCreatePayload = (p: any) => ({
  ...p,
  role: String(p.role ?? "").toUpperCase(),
});

const toEditPayload = (p: any) => ({ ...p });
  
/* Seluruh state & logic dipindah ke hook ini, UI tetap di page.tsx */
export function useUserManagement() {
  // tabel (seed sama)
  const [tableData, setTableData] = useState<DataRow[]>(initialTableData);

  // search & filter
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  // modals & drafts
  const [confirmDelete, setConfirmDelete] = useState<DataRow | null>(null);
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUserPayload>({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: "user",
    total_device: 0,
  });

  const [editRow, setEditRow] = useState<DataRow | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // set default +62 saat modal add terbuka
  useEffect(() => {
    if (addUserModal && !newUser.phone_number) {
      setNewUser((prev) => ({ ...prev, phone_number: "+62" }));
    }
  }, [addUserModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // filter data
  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.username,
        d.email,
        d.phone_number,
        d.role,
        d.total_device,
        d.created_at,
      ]
        .join(" ")
        .toLowerCase();

      const [createdDate, createdTime] = d.created_at.split(" ");
      return (
        combined.includes(lowerSearch) &&
        (!filterDate || createdDate === filterDate) &&
        (!timeFrom || createdTime >= timeFrom) &&
        (!timeTo || createdTime <= timeTo)
      );
    });
  }, [tableData, debouncedSearch, filterDate, timeFrom, timeTo]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        // ambil besar supaya pagination/filter tetap di FE
        const res = await fetch(`${ADMIN_USERS_API}?page=1&pageSize=5000`, {
          method: "GET",
          headers: { ...getAuthHeaders() },
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        const rows =
          Array.isArray(json?.rows) ? json.rows.map(toRow)
          : Array.isArray(json)     ? json.map(toRow)
          : [];
        if (!aborted) setTableData(rows);
      } catch (err) {
        console.error("Load users failed:", err);
      }
    })();
    return () => { aborted = true; };
  }, []);

  // pagination
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    const start = (currentPage - 1) * show;
    return filteredData.slice(start, start + show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  // export xls
  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Management");

    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Username", key: "username", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone Number", key: "phone_number", width: 15 },
      { header: "Role", key: "role", width: 10 },
      { header: "Total Devices", key: "total_device", width: 15 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    filteredData.forEach((item) =>
      worksheet.addRow({ ...item, phone_number: item.phone_number.toString() })
    );

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

    saveAs(blob, "User_Management.xlsx");
  };

  // helpers API
  const safeErrorMessage = async (res: Response) => {
    try {
      const t = await res.text();
      try {
        const j = JSON.parse(t);
        return j?.message || j?.error || t;
      } catch {
        return t;
      }
    } catch {
      return "";
    }
  };

  const addUserToAPI = async (payload: NewUserPayload) => {
    const body = {
      username: payload.username?.trim(),
      email: payload.email?.trim(),
      phone_number: payload.phone_number?.trim(),
      password: payload.password,
      ...(payload?.confirmPassword ? { confirmPassword: payload.confirmPassword } : {}),
      role: String(payload.role ?? "").toUpperCase(),   // user -> USER
    };
    const res = await fetch(`${ADMIN_USERS_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    
    if (!res.ok) {
      const msg = await safeErrorMessage(res);
      throw new Error(msg || `Failed to create user (${res.status})`);
    }
    const data = await res.json();
    return toRow(data);
  };

  const updateUserToAPI = async (
    id: string,
    payload: Partial<EditDraft> & { password?: string }
  ) => {
    const body: any = {
      ...(payload.username ? { username: String(payload.username).trim() } : {}),
      ...(payload.email ? { email: String(payload.email).trim() } : {}),
      ...(payload.phone_number ? { phone_number: String(payload.phone_number).trim() } : {}),
      ...(payload.password ? { password: payload.password } : {}),
    };
    const res = await fetch(`${ADMIN_USERS_API}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await safeErrorMessage(res);
      throw new Error(msg || `Failed to update user (${res.status})`);
    }
    const data = await res.json();
    return toRow(data);
  };

  const handleDelete = async (row: DataRow) => {
    setApiError("");
    try {
      const res = await fetch(`${ADMIN_USERS_API}/${row.id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await safeErrorMessage(res);
        throw new Error(msg || `Failed to delete user (${res.status})`);
      }
      setTableData((prev) => prev.filter((item) => item.id !== row.id));
    } catch (e: any) {
      setApiError(e?.message || "Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleAddUser = async () => {
    const errors = validateNewUser(newUser);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setApiError("");
    setSubmittingAdd(true);
    try {
      const created = await addUserToAPI(newUser);
      if (created && created.id) {
        const normalized: DataRow = {
          id: String(created.id),
          username: created.username ?? newUser.username,
          email: created.email ?? newUser.email,
          phone_number: created.phone_number ?? newUser.phone_number,
          password: "",
          confirmPassword: "",
          role: created.role ?? newUser.role,
          total_device: (created as any).total_device ?? newUser.total_device,
          created_at:
            (created as any).created_at ??
            new Date().toISOString().replace("T", " ").slice(0, 19),
        };
        setTableData((prev) => [normalized, ...prev]);
      }
      setAddUserModal(false);
      setNewUser({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        role: "user",
        total_device: 0,
      });
      setFormErrors({});
    } catch (err: any) {
      const msg = err?.message || "Failed to update user";
      if (msg.includes("email")) setFormErrors({ email: msg });
      else if (msg.includes("username")) setFormErrors({ username: msg });
      else setApiError(msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const openEdit = (row: DataRow) => {
    setEditRow(row);
    setEditDraft({
      username: row.username,
      email: row.email,
      phone_number: row.phone_number,
      role: row.role,
      total_device: row.total_device,
    });
    setApiError("");
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editRow || !editDraft) return;
    setSubmittingEdit(true);
    setApiError("");

    try {
      const payload = {
        username: editDraft.username,
        email: editDraft.email,
        phone_number: editDraft.phone_number,
        role: editDraft.role,
        total_device: editDraft.total_device,
      };

      const updated = await updateUserToAPI(editRow.id, payload);

      setTableData((prev) =>
        prev.map((item) =>
          item.id === editRow.id ? { ...item, ...payload, ...updated } : item
        )
      );

      setEditModal(false);
      setEditRow(null);
      setEditDraft(null);
    } catch (err: any) {
      setApiError(err?.message || "Failed to update user");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // helper untuk date/time picker
  const openPicker = (el: HTMLInputElement) => {
    if (!el) return;
    try {
      el.focus();
      // Lebih aman pakai click(), dan coba showPicker kalau tersedia
      if (typeof (el as any).showPicker === "function") {
        try {
          (el as any).showPicker();
          return;
        } catch {
        }
      }
      el.click(); // fallback universal
    } catch {
    }
  };


  return {
    // state dasar
    tableData,
    search, setSearch,
    show, setShow,
    currentPage, setCurrentPage,
    filterDate, setFilterDate,
    timeFrom, setTimeFrom,
    timeTo, setTimeTo,

    // modal & draft
    confirmDelete, setConfirmDelete,
    addUserModal, setAddUserModal,
    newUser, setNewUser,
    editRow, setEditRow,
    editModal, setEditModal,
    editDraft, setEditDraft,

    // status
    submittingAdd, submittingEdit, apiError, setApiError,
    formErrors, setFormErrors,

    // derived
    filteredData,
    paginatedData,
    totalPages,

    // actions
    handleDelete,
    handleAddUser,
    openEdit,
    handleSaveEdit,
    exportXLS,
    openPicker,
  };
}
