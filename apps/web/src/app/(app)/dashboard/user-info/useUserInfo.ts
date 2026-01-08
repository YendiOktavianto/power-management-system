"use client";

import { useEffect, useState, useRef } from "react";
import type { Area, Editing, Errors, FormState, Point, ShowPW, UserInfoDTO, ToastPayload, ToastKind } from "./types";
import { API_USER_INFO, API_USER_INFO_PASSWORD, API_USER_INFO_PHOTO, API_USER_INFO_PROFILE } from "./constants";
import { authHeaders, normalizePhone, validateForm } from "./validation";
import getCroppedImg from "../utils/cropImage";

type TemplateItem = { url: string; label: string; group: string };

async function readErrorMessage(res: Response) {
  try {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await res.json();
      if (typeof body === "string") return body;
      if (Array.isArray(body?.message)) return body.message.join(", ");
      return body?.message || body?.error || res.statusText || "Request failed";
    }
    const text = await res.text();
    return text || res.statusText || "Request failed";
  } catch {
    return res.statusText || "Request failed";
  }
}

// Resize template (SVG di /public) → PNG kecil (max 128px)
async function templateToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available"));
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous"; // aman untuk static file dari domain yang sama

    img.onload = () => {
      const maxSize = 128; // maksimal sisi panjang 128px
      let width = img.width;
      let height = img.height;

      // pertahankan rasio
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas is not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // PNG kecil
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load template image"));
    };

    img.src = url; // contoh: "/profile/avatar-1.svg"
  });
}

function redirectToLoginFromClient() {
  if (typeof window === "undefined") return;

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/dashboard/site-monitoring");
  window.location.href = `/login?next=${next}`;
}
  
export default function useUserInfo() {
  const [toastEvent, setToastEvent] = useState<ToastPayload>({ type: "info", text: "", id: 0 });
  const toastIdRef = useRef(0);

  const pushToast = (type: ToastKind, text: string) => {
    const id = ++toastIdRef.current;
    setToastEvent({ type, text, id });
  };

  const broadcastAvatarChange = (url: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("avatar:changed", { detail: { url } })
    );
  };

  const [info, setInfo] = useState({
    username: "",
    password: "********",
    phone_number: "",
    email: "",
    avatar: "/profile.svg",
  });

  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Errors>({});
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [showPW, setShowPW] = useState<ShowPW>({ old: false, new: false, confirm: false });
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(API_USER_INFO, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        cache: "no-store",
      });
      
      if (res.status === 401) {
        console.warn("[SiteMonitoring] 401 – redirecting to /login");
        redirectToLoginFromClient();
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${txt}`);
      }
      const data: UserInfoDTO = await res.json();
      const avatar = data.profileImg || "/profile.svg";
      setInfo({
        username: data.username || "",
        password: "********",
        phone_number: data.phoneNumber || "",
        email: data.email || "",
        avatar: data.profileImg || "/profile.svg",
      });
      broadcastAvatarChange(avatar);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load user data";
      pushToast("error", `${msg}`);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/avatar-templates", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { items: TemplateItem[] };
      setTemplates(data.items || []);
      setTemplatesLoaded(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load templates";
      pushToast("error", `${msg}`);
    }
  };

  useEffect(() => {
    void fetchUserInfo();
  }, []);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleEdit = (type: "avatar" | "phone" | "password") => {
    setEditing(type);
    setErrors({});
    if (type === "phone") {
      setForm({ phone_number: info.phone_number || "+628" });
    } else if (type === "password") {
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else if (type === "avatar") {
      setForm({ file: null, templateUrl: null });
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (!templatesLoaded) void fetchTemplates();
    }
  };

  const handleSave = async () => {
    const v = validateForm(editing, form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setSaving(true);
      if (editing === "phone") {
        const phone = normalizePhone(form.phone_number ?? "");
        if (!/^\+628\d{8,15}$/.test(phone)) {
          setErrors({ phone_number: "invalid Indonesian phone number format" });
          return;
        }
        const res = await fetch(API_USER_INFO_PROFILE, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        if (!res.ok) {
          pushToast("error",`${await readErrorMessage(res)}`);
          return;
        }
        pushToast("success","Mobile number updated");
        setEditing(null);
        setForm((s) => ({ ...s, phone_number: phone }));
        await fetchUserInfo();
        return;
      }

      if (editing === "password") {
        if (!form.oldPassword) {
          setErrors({ oldPassword: "old password is required" });
          pushToast("error","Invalid, Please check your input.");
          return;
        }
        if (!form.newPassword || form.newPassword.length < 8) {
          setErrors({ newPassword: "min 8 characters" });
          pushToast("error","Invalid, Please check your input.");
          return;
        }
        if (form.newPassword !== form.confirmPassword) {
          setErrors({ confirmPassword: "passwords do not match" });
          pushToast("error","Invalid, Please check your input.");
          return;
        }

        const res = await fetch(API_USER_INFO_PASSWORD, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ currentPassword: form.oldPassword, newPassword: form.newPassword }),
        });
        if (!res.ok) {
          const msg = await readErrorMessage(res);
          if (/incorrect/i.test(msg)) setErrors({ oldPassword: "current password is incorrect" });
          else if (/must be different/i.test(msg)) setErrors({ newPassword: "new password must be different from current password" });
          pushToast("error",`${msg}`);
          return;
        }
        pushToast("success","Password changed successfully");
        setEditing(null);
        setForm((s) => ({ ...s, oldPassword: "", newPassword: "", confirmPassword: "" }));
        return;
      }

if (editing === "avatar") {
  // TEMPLATE
  if (form.templateUrl) {
    try {
      const base64Image = await templateToBase64(form.templateUrl);

      const res = await fetch(API_USER_INFO_PHOTO, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ base64Image }),
      });

      if (!res.ok) {
        pushToast("error", `${await readErrorMessage(res)}`);
        return;
      }

      pushToast("success", "Profile photo updated");
      await fetchUserInfo(); // ini juga broadcastAvatarChange(avatar)
      setEditing(null);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile photo";
      pushToast("error", msg);
      return;
    }
  }

  // === CASE: upload & crop ===
  if (!form.file || !fileUrl) {
    pushToast("error","Please select an image first");
    return;
  }
  if (!croppedAreaPixels) {
    pushToast("error","Adjust the crop area before saving");
    return;
  }
  const croppedImage = await getCroppedImg(fileUrl, croppedAreaPixels);
  const res = await fetch(API_USER_INFO_PHOTO, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ base64Image: croppedImage }),
  });
  if (!res.ok) {
    pushToast("error",`${await readErrorMessage(res)}`);
    return;
  }
  URL.revokeObjectURL(fileUrl);
  setFileUrl(null);
  pushToast("success","Profile photo updated");
  await fetchUserInfo();
  setEditing(null);
  return;
}

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save changes";
      pushToast("error",`${msg}`);
    } finally {
      setSaving(false);
    }
  };
  
  return {
    info,
    setInfo,
    editing,
    setEditing,
    form,
    setForm,
    errors,
    setErrors,
    crop,
    setCrop,
    zoom,
    setZoom,
    setCroppedAreaPixels,
    fileUrl,
    setFileUrl,
    showPW,
    setShowPW,
    handleEdit,
    handleSave,
    fetchUserInfo,
    templates,
    fetchTemplates,
    saving,
    toastEvent,
  };
}
