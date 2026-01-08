// apps/web/src/app/(auth)/register/validation.ts

import type { FormState } from "./types";

export const validateForm = (form: FormState): FormState => {
  const newErrors: FormState = {
    email: "",
    username: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  };

  // ===== email =====
  if (!form.email) {
    newErrors.email = "email is required";
  } else if (form.email.length > 100) {
    newErrors.email = "email must not exceed 100 characters";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = "please enter a valid email address";
  } else {
    const parts = form.email.split("@");
    if (parts.length !== 2) {
      newErrors.email = "email must contain one @ character";
    } else {
      const [local, domain] = parts;
      if (!/^[A-Za-z0-9._+~-]+$/.test(local)) {
        newErrors.email = "email local part contains invalid characters";
      }
      const domainRegex =
        /^(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*\.[A-Za-z]{2,}$/;
      if (!domainRegex.test(domain)) {
        newErrors.email = "email domain is invalid";
      }
    }
  }

  // ===== username =====
  if (!form.username) {
    newErrors.username = "username is required";
  } else if (form.username.length < 8) {
    newErrors.username = "username must be at least 8 characters";
  } else if (form.username.length > 30) {
    newErrors.username = "username must be at most 30 characters";
  } else if (/\s/.test(form.username)) {
    newErrors.username = "username cannot contain spaces";
  } else if (!/^[A-Z]/.test(form.username)) {
    newErrors.username = "username must start with an uppercase letter";
  } else if (!/^[A-Z][A-Za-z0-9_.\-@!#$%^&*]+$/.test(form.username)) {
    newErrors.username =
      "username can only contain letters, numbers, and special characters . _ - @ ! # $ % ^ & *";
  }

  // ===== phone =====
  if (!form.phone_number) {
    newErrors.phone_number = "phone number is required";
  } else if (!/^\+628\d{8,15}$/.test(form.phone_number)) {
    if (!form.phone_number.startsWith("+628")) {
      newErrors.phone_number = "phone number must start with +628";
    } else if (form.phone_number.length < 10) {
      newErrors.phone_number = "phone number is too short (min 10 chars)";
    } else if (form.phone_number.length > 16) {
      newErrors.phone_number = "phone number is too long (max 16 chars)";
    } else {
      newErrors.phone_number = "invalid Indonesian phone number format";
    }
  }

  // ===== password =====
  if (!form.password) {
    newErrors.password = "password is required";
  } else if (form.password.length < 8) {
    newErrors.password = "password must be at least 8 characters";
  } else if (form.password.length > 20) {
    newErrors.password = "password must be at most 20 characters";
  } else if (!/[A-Z]/.test(form.password)) {
    newErrors.password = "password must include at least one uppercase letter";
  } else if (!/[a-z]/.test(form.password)) {
    newErrors.password = "password must include at least one lowercase letter";
  } else if (!/\d/.test(form.password)) {
    newErrors.password = "password must include at least one number";
  } else if (!/[^A-Za-z0-9]/.test(form.password)) {
    newErrors.password = "password must include at least one special character";
  } else if (/(0123|1234|2345|3456|4567|5678|6789)/.test(form.password)) {
    newErrors.password = "password must not contain sequential numbers";
  } else {
    const lc = form.password.toLowerCase();
    if (["password", "qwerty", "12345", "123456", "abc123", "tanggal"].some((p) => lc.includes(p))) {
      newErrors.password = "password must not contain common patterns";
    }
    if (/\b(?:\d{2}[-/]?\d{2}[-/]?\d{4}|\d{4}[-/]?\d{2}[-/]?\d{2})\b/.test(form.password)) {
      newErrors.password = "password must not contain dates";
    }
  }

  // ===== confirm =====
  if (!form.confirmPassword) {
    newErrors.confirmPassword = "confirm password is required";
  } else if (form.confirmPassword !== form.password) {
    newErrors.confirmPassword = "confirm password does not match";
  }

  return newErrors;
};
