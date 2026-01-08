"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useMemo, useEffect, useRef } from "react";
import { useVerify } from "./useVerify";

import FullScreenBg from "@/components/common/layout/FullScreenBgAuth";
import AuthCard from "@/components/features/auth/AuthCard";
import SubmitButton from "@/components/ui/Button";
import BackButton from "@/components/ui/BackButton";
import AuthHeading from "@/components/features/auth/AuthHeading";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastMessageInline from "@/components/common/ToastMessageInline";
import OtpInputs from "./_components/OtpInput";
import { ICON_KEY_URL } from "./constants";

function VerifyUI() {
  const {
    email,
    maskedEmail,       
    state,
    inputRefs,
    message,
    messageType,
    toast,               
    timer,
    loading,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
    router,
  } = useVerify();

  const toastApi = useToast();
  const lastToastKey = useRef<string>("");

  useEffect(() => {
    if (!toast.type || !toast.text) return;
    const key = `${toast.type}:${toast.text}`;
    if (lastToastKey.current === key) return;
    if (toast.type === "success") toastApi.success(toast.text);
    else if (toast.type === "error") toastApi.error(toast.text);
    else toastApi.info?.(toast.text);
    lastToastKey.current = key;
  }, [toast, toastApi]);

  const isComplete = useMemo(() => state.code.every((c) => (c ?? "").length === 1), [state.code]);
  const isDisabled = useMemo(() => loading || !isComplete, [loading, isComplete]);

  return (
    <FullScreenBg>
      <AuthCard>
        <BackButton 
          onClick={() => {        
            router.push(`/forgot?email=${encodeURIComponent(maskedEmail ? ('') : '')}`);
          }}
          aria-label="Go back to previous page"
        />
        <AuthHeading
          image={{ src: ICON_KEY_URL, alt: "Key Icon", width: 120, height: 120 }}
          title="Verify Your Mail"
          subtitle={
            <>
              Please enter the 4 digit code sent to{" "}
              <span className="block font-medium break-all">{maskedEmail}</span>
            </>
          }
        />

        <form
          className="flex flex-col items-center gap-4 w-full"
          onSubmit={handleSubmit}
          autoComplete="off"
          noValidate
          aria-busy={loading}
        >
          <OtpInputs
            code={state.code}
            inputRefs={inputRefs}
            onChangeDigit={handleChange}
            onKeyDownDigit={handleKeyDown}
            loading={loading}
          />

          {message && messageType === "error" && (
            <p className="text-red-400 text-sm" role="alert" aria-live="assertive">
              {message}
            </p>
          )}

          <SubmitButton
            type="submit"
            label="Verify"
            loadingLabel="Processing..."
            loading={loading}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          />
        </form>

        {/* Inline success (opsional) */}
        {message && messageType === "success" && (
          <div className="w-full text-center text-sm text-green-400 bg-green-900/30 py-2 px-3 mt-3 rounded-lg">
            {message}
          </div>
        )}

        <p className="text-xs text-gray-300 mt-4">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={timer === 0 ? handleResend : undefined}
            disabled={timer > 0 || loading}
            className={`underline-offset-2 ${timer === 0 && !loading ? "text-[#2196F3]" : "text-gray-400 cursor-not-allowed"}`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend"}
          </button>
        </p>
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

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyUI />
    </Suspense>
  );
}
