"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerifyState, MessageType } from "./types";
import { validateOTP } from "./validation";
import { MESSAGES, OTP_LENGTH } from "./constants";
import { jsonFetch } from "../../lib/api";
import { errorMessage } from "../../lib/error";

function maskEmail(email: string): string {
  const e = (email || "").trim();
  const [localRaw, domainRaw] = e.split("@");
  if (!localRaw || !domainRaw) return "****";

  const local = localRaw;
  const labels = domainRaw.split(".");
  if (labels.length < 2) return "****";

  const tld = labels.pop()!;           
  const sldRaw = labels.pop() || "";  
  const sub = labels.join(".");       

  let maskedLocal = "";
  if (local.length <= 2) {
    maskedLocal = local[0] + "*";
  } else if (local.length <= 5) {
    const middle = Math.max(1, local.length - 3);
    maskedLocal = local.slice(0, 2) + "*".repeat(middle) + local.slice(-1);
  } else {
    const middle = Math.max(2, local.length - 5);
    maskedLocal = local.slice(0, 3) + "*".repeat(middle) + local.slice(-2);
  }

  let maskedSld = "";
  if (sldRaw.length <= 2) {
    maskedSld = sldRaw[0] + "*";
  } else if (sldRaw.length <= 5) {
    maskedSld = sldRaw.slice(0, 2) + "*".repeat(sldRaw.length - 2);
  } else {
    maskedSld = sldRaw.slice(0, 2) + "*".repeat(Math.max(2, sldRaw.length - 3)) + sldRaw.slice(-1);
  }

  const domain = (sub ? sub + "." : "") + maskedSld + "." + tld;
  return `${maskedLocal}@${domain}`;
}

type ToastKind = "success" | "error" | "info" | "";
type ToastPayload = { type: ToastKind; text: string; id: number };

export const useVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams?.get("email") || "").trim();    
  const maskedEmail = useMemo(() => maskEmail(email), [email]); 

  const [state, setState] = useState<VerifyState>({ code: Array(OTP_LENGTH).fill("") });
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<ToastPayload>({ type: "", text: "", id: 0 });
  const lastToastRef = useRef<string>("");
  const pushToast = (type: ToastKind, text: string) => {
    const key = `${type}:${text}`;
    if (lastToastRef.current === key) return; 
    lastToastRef.current = key;
    setToast({ type, text, id: Date.now() });
    setTimeout(() => {
      if (lastToastRef.current === key) lastToastRef.current = "";
    }, 80);
  };

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (!messageType) return;
    const timeout = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [messageType]);

  useEffect(() => {
    if (!email) {
      setMessage("Missing email address.");
      setMessageType("error");
    }
  }, [email]);

  useEffect(() => {
    setState({ code: Array(OTP_LENGTH).fill("") });
    setTimer(0);
  }, [email]);

  const handleChange = (idx: number, val: string) => {
    if (loading) return;
    setMessage("");
    if (!/^\d?$/.test(val)) return; 
    setState((s) => {
      const next = [...s.code];
      next[idx] = val;
      return { code: next };
    });
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && !state.code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email) {
      pushToast("error", "Email is required to continue.");
      return;
    }

    const err = validateOTP(state.code);
    if (err) {
      setMessage(err);             
      setMessageType("error");
      pushToast("error", err);      
      return;
    }

    const code = state.code.join("");

    try {
      setMessage("");
      setMessageType("");
      setLoading(true);
      pushToast("info", "Verifying code...");

      const res = await jsonFetch<{ ok: boolean }>("/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({ email, code }), // email asli untuk backend
      });

      if (!res.ok) {
        setMessage(MESSAGES.invalidCode);
        setMessageType("error");
        pushToast("error", "Invalid code. Please try again.");
        return;
      }

      // Berhasil
      setMessage(MESSAGES.success); 
      setMessageType("success");
      pushToast("success", `Code verified. Redirecting…`);

      router.push(
        `/resetpassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
      );
    } catch (e: unknown) {
      setMessage(errorMessage(e, MESSAGES.invalidCode));
      setMessageType("error");
      pushToast("error", "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    if (!email) {
      pushToast("error", "Email is required to continue.");
      return;
    }
    try {
      setLoading(true);
      pushToast("info", "Sending new code");

      await jsonFetch<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }), 
      });

      setState({ code: Array(OTP_LENGTH).fill("") });
      requestAnimationFrame(() => inputRefs.current[0]?.focus());

      // inline + toast sukses
      setMessage(MESSAGES.resendSuccess(maskedEmail));
      setMessageType("success");
      setTimer(60);
    } catch (e: unknown) {
      setMessage(errorMessage(e, "Failed to resend code"));
      setMessageType("error");
      pushToast("error", "Couldn’t resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const flag = sessionStorage.getItem("verify-entry");
    const allowed = flag === "from-forgot" || flag === "consumed";
    if (!allowed) {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      router.replace(`/forgot${q}`);
      return;
    }
    sessionStorage.setItem("verify-entry", "consumed");
  }, [router, email]);

  return {
    email,         
    maskedEmail,   
    state,
    inputRefs,
    message,
    messageType,
    timer,
    toast,
    loading,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
    router,
  };
};
