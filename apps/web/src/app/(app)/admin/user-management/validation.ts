import type { NewUserPayload } from "./types";

/* Kumpulkan validasi agar tetap sama hasil & pesannya */
export function validateNewUser(newUser: NewUserPayload) {
  const errors: Record<string, string> = {};

  // email
  if (!newUser.email) {
    errors.email = "email is required";
  } else if (newUser.email.length > 100) {
    errors.email = "email must not exceed 100 characters";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
    errors.email = "please enter a valid email address";
  } else {
    const parts = newUser.email.split("@");
    if (parts.length !== 2) {
      errors.email = "email must contain one @ character";
    } else {
      const [local, domain] = parts;
      if (!/^[A-Za-z0-9._+~-]+$/.test(local)) {
        errors.email = "email local part contains invalid characters";
      }
      const domainRegex =
        /^(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*\.[A-Za-z]{2,}$/;
      if (!domainRegex.test(domain)) {
        errors.email = "email domain is invalid";
      }
    }
  }

  // username
  if (!newUser.username.trim()) errors.username = "username is required";
  else if (newUser.username.length < 8) {
    errors.username = "username must be at least 8 characters";
  } else if (newUser.username.length > 30) {
    errors.username = "username must be at most 30 characters";
  } else if (/\s/.test(newUser.username)) {
    errors.username = "username cannot contain spaces";
  } else if (!/^[A-Z]/.test(newUser.username)) {
    errors.username = "username must start with an uppercase letter";
  } else if (!/^[A-Z][A-Za-z0-9_.\-@!#$%^&*]+$/.test(newUser.username)) {
    errors.username =
      "username can only contain letters, numbers, and special characters . _ - @ ! # $ % ^ & *";
  }

  // phone
  if (!newUser.phone_number) {
    errors.phone_number = "phone number is required";
  } else if (!/^\+628\d{8,15}$/.test(newUser.phone_number)) {
    if (!newUser.phone_number.startsWith("+628")) {
      errors.phone_number = "phone number must start with +628";
    } else if (newUser.phone_number.length < 10) {
      errors.phone_number = "phone number is too short (min 10 chars)";
    } else if (newUser.phone_number.length > 16) {
      errors.phone_number = "phone number is too long (max 16 chars)";
    } else {
      errors.phone_number = "invalid Indonesian phone number format";
    }
  }

  // password
  if (!newUser.password) {
    errors.password = "password is required";
  } else if (newUser.password.length < 8) {
    errors.password = "password must be at least 8 characters";
  } else if (newUser.password.length > 20) {
    errors.password = "password must be at most 20 characters";
  } else if (!/[A-Z]/.test(newUser.password)) {
    errors.password = "password must include at least one uppercase letter";
  } else if (!/[a-z]/.test(newUser.password)) {
    errors.password = "password must include at least one lowercase letter";
  } else if (!/\d/.test(newUser.password)) {
    errors.password = "password must include at least one number";
  } else if (!/[^A-Za-z0-9]/.test(newUser.password)) {
    errors.password = "password must include at least one special character";
  } else if (/(0123|1234|2345|3456|4567|5678|6789)/.test(newUser.password)) {
    errors.password = "password must not contain sequential numbers";
  } else {
    const lc = newUser.password.toLowerCase();
    if (["password", "qwerty", "12345", "123456", "abc123", "tanggal"].some((p) => lc.includes(p))) {
      errors.password = "password must not contain common patterns";
    }
    if (/\b(?:\d{2}[-/]?\d{2}[-/]?\d{4}|\d{4}[-/]?\d{2}[-/]?\d{2})\b/.test(newUser.password)) {
      errors.password = "password must not contain dates";
    }
  }

  if (!newUser.confirmPassword) errors.confirmPassword = "confirm password is required";
  else if (newUser.confirmPassword !== newUser.password)
    errors.confirmPassword = "confirm password does not match";

  return errors;
}
