"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useForgot } from "./useForgot";

import FormInput from "@/components/ui/FormInput";
import SubmitButton from "@/components/ui/Button";
import AuthCard from "@/components/features/auth/AuthCard";
import FullScreenBg from "@/components/common/layout/FullScreenBgAuth";
import useToast from "@/components/common/hooks/useToastMessage";
import BackButton from "@/components/ui/BackButton";
import AuthHeading from "@/components/features/auth/AuthHeading";
import ToastMessageInline from "@/components/common/ToastMessageInline";

import { ICON_KEY_URL, ICON_EMAIL_URL } from "./constants";

function ForgotUI() {
  const { form, error, success, loading, handleChange, handleSubmit, router } = useForgot();
  const toastApi = useToast();
  const lastShown = useRef<string>("");
  const isSuccess = Boolean(success);
  
  const handleEnter = () => {
    sessionStorage.setItem("verify-entry", "from-forgot");
    const emailTrim = form.email.trim();
    router.push(`/verify?email=${encodeURIComponent(emailTrim)}`);
  };

  useEffect(() => {
    if (!success) return;
    if (success === lastShown.current) return; 
    lastShown.current = success;

    toastApi.success(success);

  }, [success]);

  const isDisabled = useMemo(() => loading || form.email.trim() === "", [loading, form.email]);

  return (
    <FullScreenBg>
      <AuthCard>
        <BackButton onClick={() => router.push("/login")} aria-label="Go back to previous page" />

        <AuthHeading
          image={{ src: ICON_KEY_URL, alt: "Key Icon", width: 180, height: 180 }}
          title="Forgot Password"
          subtitle="Enter your email and we’ll send you a verification code"
        />

        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={loading}
          onKeyDown={(e) => {
            if (isSuccess && e.key === "Enter") e.preventDefault();
          }}
        >
          <FormInput
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange(e.target.value.trim())} 
            error={error || ""} 
            leftIcon={<Image src={ICON_EMAIL_URL} alt="email" width={17} height={19} />}
            size="lg"
            autoFocus
            disabled={loading}
          />

          {isSuccess && (
            <p className="text-xs text-green-400 mt-1 mb-[-15px]" aria-live="polite">
              We’ve sent a verification code. Open the verification screen to continue.
            </p>
          )}

          <SubmitButton
            type={isSuccess ? "button" : "submit"}
            label={
              <span className="inline-flex items-center gap-2">
                {!isSuccess ? <Mail className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {!isSuccess ? "Send Code" : "Enter Code"}
              </span>
            }
            loadingLabel={!isSuccess ? "Sending..." : "Opening..."}
            loading={loading}
            disabled={!isSuccess ? (loading || form.email.trim() === "") : false}
            aria-disabled={!isSuccess ? (loading || form.email.trim() === "") : false}
            onClick={isSuccess ? handleEnter : undefined}
            {...(isSuccess
              ? { className: "bg-green-600 hover:bg-green-700" }
              : {})}
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

export default function ForgotPage() {
  return (
    <Suspense fallback={null}>
      <ForgotUI />
    </Suspense>
  );
}
