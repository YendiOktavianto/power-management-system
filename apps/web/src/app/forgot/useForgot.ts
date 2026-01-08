"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ForgotForm } from "./types";
import { validateEmail } from "./validation";
import { ERROR_MESSAGES } from "./constants";
import { jsonFetch } from "../../lib/api";
import { errorMessage } from "../../lib/error";

export const useForgot = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<ForgotForm>({ email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = (searchParams?.get("email") || "").trim();
    if (q && q !== form.email) {
      setForm({ email: q });
      setError("");
      setSuccess("");
    }
  }, [searchParams]);

  const handleChange = (value: string) => {
    setForm({ email: value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const emailInput = form.email.trim();
    const emailError = validateEmail(emailInput);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      const emailForBackend = emailInput.toLowerCase();
      await jsonFetch<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: emailForBackend }),
      });

      setSuccess("If that email exists, we've sent a verification code.");
    } catch (e: unknown) {
      setError(errorMessage(e, ERROR_MESSAGES.serverError));
    } finally {
      setLoading(false);
    }
  };

  return { form, error, success, loading, handleChange, handleSubmit, router };
};
