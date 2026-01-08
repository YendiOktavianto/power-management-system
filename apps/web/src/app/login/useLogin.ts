"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormState, ErrorsState, Role, ToastPayload, ToastKind } from "./types";
import { validateField } from "./validation";
import { ERROR_MESSAGES, ROLE_REDIRECT } from "./constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const extractAccessToken = (data: any): string | null =>
  data?.access_token ??
  data?.accessToken ??
  data?.token ??
  data?.result?.access_token ??
  data?.result?.accessToken ??
  null;

const isJwt = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(v);

const normalizeRole = (r: unknown): Role =>
  String(r ?? "user").toLowerCase() === "admin" ? "admin" : "user";

const isEmail = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export const useLogin = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<ErrorsState>({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [toastEvent, setToastEvent] = useState<ToastPayload>({ type: "info", text: "", id: 0 });
  const toastIdRef = useRef(0);

  const pushToast = (type: ToastKind, text: string) => {
    const id = ++toastIdRef.current;
    setToastEvent({ type, text, id });
  };

  const [failCount, setFailCount] = useState(0);
  const lastIdRef = useRef<string>("");

  useEffect(() => {
    const id = form.identifier.trim();
    if (id !== lastIdRef.current) {
      lastIdRef.current = id;
      setFailCount(0);
    }
  }, [form.identifier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ErrorsState = {
      identifier: validateField("identifier", form.identifier),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);
    if (!Object.values(newErrors).every((err) => err === "")) {
      pushToast("error", "Please check your Inputs.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, rememberMe }),
      });

      let data: any = null;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok) {
        // mapping error ke field
        if (data?.errors && typeof data.errors === "object") {
          setErrors({
            identifier: data.errors.identifier ?? "",
            password:   data.errors.password   ?? "",
          });
        } else {
          const msg = String(data?.message ?? "").toLowerCase();
          if (msg.includes("username") || msg.includes("email") || msg.includes("identifier")) {
            setErrors({ identifier: "Incorrect Email or Username", password: "" });
          } else if (msg.includes("password")) {
            setErrors({ identifier: "", password: "Incorrect Password" });
          } else if (msg.includes("invalid credentials")) {
            setErrors({ identifier: "Incorrect Email or Username", password: "Incorrect Password" });
          } else {
            setErrors({ identifier: "", password: ERROR_MESSAGES.unknownError });
          }
        }

        pushToast("error", "Login failed. Please check your credentials.");

        // ++ gagal & cek limit
        setFailCount((prev) => {
          const next = prev + 1;
          if (next >= 15) {
            pushToast("danger", "Too many attempts. Let’s reset your password. Redirect...");
              setTimeout(() => {
              try { sessionStorage.setItem("verify-entry", "from-forgot"); } catch {}
              const id = form.identifier.trim();
              router.replace(isEmail(id) ? `/forgot?email=${encodeURIComponent(id)}` : `/forgot`);
            }, 4000);
          }
          return next;
        });

        setLoading(false);
        return;
      }

      // sukses ➜ reset fail count
      setFailCount(0);
      pushToast("success", "Logged in. Redirecting…");

      const rawRole = data?.role ?? data?.user?.role ?? data?.user?.roles?.[0] ?? "user";
      const role    = normalizeRole(rawRole);
      const target  = ROLE_REDIRECT[role] ?? "/dashboard";

      const accessToken = extractAccessToken(data);

      try {
        if (isJwt(accessToken)) {
          const key = role === "admin" ? "access_token_admin" : "access_token_user";
          localStorage.setItem(key, accessToken);
          localStorage.removeItem(role === "admin" ? "access_token_user" : "access_token_admin");
        } else {
          localStorage.removeItem("access_token_admin");
          localStorage.removeItem("access_token_user");
        }
      } catch {}

      // Simpan role ke cookie (dibaca middleware) - non HttpOnly
      try {
        const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
        const domainPart = domain ? ` Domain=${domain};` : "";
        const sameSitePart = domain ? " SameSite=None;" : " SameSite=Lax;";
        const securePart = domain ? " Secure;" : "";
        document.cookie = `role=${role.toUpperCase()}; Path=/;${domainPart}${sameSitePart}${securePart}`;
      } catch {}

      router.push(target);
    } catch {
      setErrors({ identifier: ERROR_MESSAGES.serverError, password: "" });
      pushToast("error", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    rememberMe,
    loading,
    showPassword,
    setShowPassword,
    setRememberMe,
    handleChange,
    handleSubmit,
    router,
    toastEvent,
    
  };
};
