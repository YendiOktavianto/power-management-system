"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLogin } from "./useLogin";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import FormInput from "@/components/ui/FormInput";
import SubmitButton from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ForgotPasswordLink from "./_components/ForgotPasswordLink";
import AuthCard from "@/components/features/auth/AuthCard";
import FullScreenBg from "@/components/common/layout/FullScreenBgAuth";
import AuthInlinePrompt from "@/components/features/auth/AuthInlinePrompt";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastMessageInline from "@/components/common/ToastMessageInline";

import { ICON_PW_URL, ICON_USER_URL, ICON_LOGO_URL} from "./constants";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function LoginUI() {
  const [bootLoading, setBootLoading] = useState(true);
  const toastApi = useToast();
  const lastToastId = useRef<number>(0);

  const {
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
  } = useLogin();

  const handleRegisterRedirect = () => router.push("/register");
  const handleLandingRedirect = () => router.push("../");

  useEffect(() => {
    if (!toastEvent?.type || !toastEvent?.text) return;
    if (lastToastId.current === toastEvent.id) return;
    lastToastId.current = toastEvent.id;

    const showInfo = toastApi.info ?? toastApi.success;
    if (toastEvent.type === "success") toastApi.success(toastEvent.text);
    else if (toastEvent.type === "error") toastApi.error(toastEvent.text);
    else if (toastEvent.type === "danger") toastApi.danger(toastEvent.text);
    else showInfo(toastEvent.text); 
  }, [toastEvent, toastApi]);

  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  const isSubmitDisabled = useMemo(() => {
    const idOk = form.identifier.trim().length > 0;
    const pwOk = form.password.trim().length > 0;
    return loading || !idOk || !pwOk;
  }, [form.identifier, form.password, loading]);

  if (bootLoading) {
    return <LoadingOverlay show={true} text="Loading..." />;
  }

  return (
    <FullScreenBg>
      <AuthCard>
        <Image src={ICON_LOGO_URL} alt="LogoBrand" width={100} height={100} className="mb-2" onClick={handleLandingRedirect} />
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-6">
          Welcome to <br /> Power Management System
        </h1>

        <form 
          className="flex flex-col w-full gap-4" 
          onSubmit={(e) => {
            if (loading) { e.preventDefault(); return; } 
            handleSubmit(e);
          }}
        >
          {/* username/email */}
          <FormInput
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            error={errors.identifier}
            leftIcon={<Image src={ICON_USER_URL} alt="user" width={17} height={19} />}
            size="lg"
          />

          {/* password */}
          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Image src={ICON_PW_URL}alt="password" width={19} height={20} />}
            passwordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            size="lg"
          />

          {/* remember me & forgot password */}
          <div className="flex items-center justify-between text-xs text-gray-300 mt-1 mb-5">
            <Checkbox
              label="remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <ForgotPasswordLink 
              label="forgot password?"
              onClick={() => {
                const id = form.identifier.trim();
                const href = isEmail(id)
                  ? `/forgot?email=${encodeURIComponent(id)}`
                  : `/forgot`;
                router.push(href);
              }}
            />
            
          </div>

          <SubmitButton
            label="Login"
            loadingLabel="Logging in..."
            loading={loading}
            disabled={isSubmitDisabled}
          />
        </form>

        <AuthInlinePrompt
          text={"Don't have an account?"}
          actionLabel="Register"
          onAction={handleRegisterRedirect}
        />
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
