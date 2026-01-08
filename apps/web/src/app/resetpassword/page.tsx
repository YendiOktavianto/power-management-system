"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import useResetPassword from "./useResetPassword";

import FullScreenBg from "@/components/common/layout/FullScreenBgAuth";
import AuthCard from "@/components/features/auth/AuthCard";
import FormInput from "@/components/ui/FormInput";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastMessageInline from "@/components/common/ToastMessageInline";
import SubmitButton from "@/components/ui/Button";
import BackButton from "@/components/ui/BackButton";
import AuthHeading from "@/components/features/auth/AuthHeading";
import { panding, approve, reject } from "@/components/ui/theme";
import { ICON_KEY_URL, ICON_PW_URL } from "./constants";

function ResetPassword() {
  const toastApi = useToast();

  const {
    form,
    errorPassword,
    errorConfirm,
    globalError,
    success,
    loading,
    passwordStrength,
    handleChange,
    handleSubmit,
    router,
  } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const lastToastRef = useRef<{ err: string; ok: string }>({ err: "", ok: "" });

  useEffect(() => {
    if (!globalError) return;
    if (lastToastRef.current.err === globalError) return; 
    toastApi.error(globalError);
    lastToastRef.current.err = globalError;
  }, [globalError]);

  useEffect(() => {
    if (!success) return;
    if (lastToastRef.current.ok === success) return;
    toastApi.success(success);
    lastToastRef.current.ok = success;
  }, [success]);

  const isDisabled = useMemo(() => {
    const hasPw = (form.password ?? "").trim().length > 0;
    const hasCf = (form.confirm ?? "").trim().length > 0;
    const hasErr = Boolean(errorPassword || errorConfirm);
    return loading || !hasPw || !hasCf || hasErr;
  }, [form.password, form.confirm, errorPassword, errorConfirm, loading]);

  return (
    <FullScreenBg>
      <AuthCard>
        <BackButton onClick={() => router.back()} aria-label="Go back to previous page" />
        <AuthHeading
          image={{ src: ICON_KEY_URL, alt: "LogoKey", width: 180, height: 180 }}
          title="Reset Password"
          subtitle="Enter your new password below"
        />

        <form
          className="flex flex-col w-full gap-4"
          onSubmit={(e) => { if (loading) { e.preventDefault(); return; } handleSubmit(e); }}
          onKeyDown={(e) => { if (loading && (e.key === "Enter" || e.key === "NumpadEnter")) e.preventDefault(); }}
          noValidate
          autoComplete="off"
          aria-busy={loading}
        >
          {/* Password */}
          <FormInput
            id="password"
            name="password"
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            leftIcon={<Image src={ICON_PW_URL} alt="password" width={19} height={20} />}
            error={errorPassword}
            passwordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            autoComplete="new-password"
            enterKeyHint="done"
            disabled={loading}
          />
          {!errorPassword && form.password && (
            <p
              className={`text-[11px] mt-[-13px] ml-4 ${
                passwordStrength === "strong"
                  ? approve
                  : passwordStrength === "medium"
                  ? panding
                  : reject
              }`}
            >
              Password strength: {passwordStrength}
            </p>
          )}

          {/* Confirm */}
          <FormInput
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => handleChange("confirm", e.target.value)}
            leftIcon={<Image src={ICON_PW_URL} alt="password" width={19} height={20} />}
            error={errorConfirm}
            passwordToggle
            showPassword={showConfirm}
            onTogglePassword={() => setShowConfirm((v) => !v)}
            autoComplete="new-password"
            enterKeyHint="done"
            disabled={loading}
          />

          <SubmitButton
            type="submit"
            label="Reset Password"
            loadingLabel="Processing..."
            loading={loading}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          />
        </form>
      </AuthCard>

      <ToastMessageInline
        toast={toastApi.toast}
        onClose={toastApi.close}
        placement="top-center"
        aria-live="polite"
      />
    </FullScreenBg>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
