"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { FormState } from "./types";
import { REGISTER_API_URL, INITIAL_FORM, INITIAL_ERRORS } from "./constants";
import { validateForm } from "./validation";
import { useAutoHideToast, useRegisterRefs } from "./useRegister";

import FormInput from "@/components/ui/FormInput";
import PhoneField from "@/components/common/forms/PhoneField";
import SubmitButton from "@/components/ui/Button";
import useToast from "@/components/common/hooks/useToastMessage";
import ToastInline from "@/components/common/ToastMessageInline";
import AuthCard from "@/components/features/auth/AuthCard";
import FullScreenBg from "@/components/common/layout/FullScreenBgAuth";
import AuthInlinePrompt from "@/components/features/auth/AuthInlinePrompt";

import { ICON_PW_URL, ICON_EMAIL_URL, ICON_USER_URL, ICON_LOGO_URL} from "./constants";

export default function Register() {
  const toastApi = useToast();
  const router = useRouter();
  const handleLoginRedirect = () => router.push("/login");
  const handleLandingRedirect = () => router.push("../");
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<FormState>({ ...INITIAL_ERRORS });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refs = useRegisterRefs<HTMLInputElement>();

  const allFilled =
    form.email.trim() !== "" &&
    form.username.trim() !== "" &&
    form.phone_number.trim() !== "" &&
    form.password.trim() !== "" &&
    form.confirmPassword.trim() !== "";

  const isDisabled = submitting || !allFilled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "confirmPassword" || name === "password") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          next.password && next.confirmPassword && next.password !== next.confirmPassword
            ? "passwords do not match"
            : "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await new Promise((r) => setTimeout(r, 50));

    const newErrors = validateForm(form);

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "passwords do not match";
    }

    setErrors(newErrors);

    if (!Object.values(newErrors).every((err) => err === "")) {
      toastApi.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { email, username, phone_number, password } = form;
      const res = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, phone_number, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const nextErrs: FormState = { ...INITIAL_ERRORS };

        if (data?.errors) {
          if (data.errors.email)        nextErrs.email = String(data.errors.email);
          if (data.errors.username)     nextErrs.username = String(data.errors.username);
          if (data.errors.phone_number) nextErrs.phone_number = String(data.errors.phone_number);
          if (data.errors.password)     nextErrs.password = String(data.errors.password);
        } else if (data?.message) {
          const msgs = Array.isArray(data.message) ? data.message : [String(data.message)];
          for (const m of msgs) {
            const lower = String(m).toLowerCase();
            if (lower.includes("username"))      nextErrs.username = m;
            else if (lower.includes("email"))    nextErrs.email = m;
            else if (lower.includes("phone"))    nextErrs.phone_number = m;
            else if (lower.includes("password")) nextErrs.password = m;
          }
          // fallback umum agar error tetap terlihat
          if (!nextErrs.email && !nextErrs.username && !nextErrs.phone_number && !nextErrs.password) {
            nextErrs.email = msgs.join(", ");
          }
        } else {
          nextErrs.email = "Registration failed.";
        }

        setErrors(nextErrs);
        toastApi.error("Registration failed! Please check your inputs.");
        return;
      }

      // success
      toastApi.success("Registration successful!");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      toastApi.error("Server error, please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  useAutoHideToast(toastMessage, () => setToastMessage(null));

  return (
    <FullScreenBg>
      <AuthCard>
        <div className="flex items-center w-full mb-6">
          <Image src={ICON_LOGO_URL} alt="LogoBrand" width={65} height={65} className="mr-4" onClick={handleLandingRedirect}/>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">Create Your Account</h1>
            <p className="text-[12px] text-gray-300 leading-tight mt-1">
              Sign up to start managing your devices with ease.
            </p>
          </div>
        </div>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {/* email */}
          <FormInput
            name="email"
            autoComplete="email"
            inputMode="email"        
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Image src={ICON_EMAIL_URL} alt="email" width={17} height={19} />}
            ref={refs.email}
            size="lg"
          />

          {/* username */}
          <FormInput
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            leftIcon={<Image src={ICON_USER_URL} alt="user" width={17} height={19} />}
            ref={refs.username}
            size="lg"
          />

          {/* phone */}
          <PhoneField
            value={form.phone_number}
            onChange={(phone) => {
              setForm((p) => ({ ...p, phone_number: phone }));
              setErrors((p) => ({ ...p, phone_number: "" }));
            }}
            error={errors.phone_number}
          />

          {/* password */}
          <FormInput
            name="password"
            autoComplete="new-password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Image src={ICON_PW_URL} alt="password" width={19} height={20} />}
            ref={refs.password}
            passwordToggle
            size="lg"
          />

          {/* confirm password */}
          <FormInput
            name="confirmPassword"
            autoComplete="new-password"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<Image src={ICON_PW_URL} alt="confirm password" width={19} height={20} />}
            ref={refs.confirmPassword}
            passwordToggle
            size="lg"
          />

          {/* submit */}
          <SubmitButton
            label="Register"
            loadingLabel="Registering..."
            loading={submitting}
            disabled={isDisabled}
          />
        </form>

        <AuthInlinePrompt
          text={"Already have an account?"}
          actionLabel="Login"
          onAction={handleLoginRedirect}
        />
      </AuthCard>
      <ToastInline 
        toast={toastApi.toast} 
        onClose={toastApi.close} 
        placement="top-center" 
        aria-live="polite"
      />
    </FullScreenBg>
  );
}
