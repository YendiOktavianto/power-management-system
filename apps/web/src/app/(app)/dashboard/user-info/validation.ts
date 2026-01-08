// app/(dashboard)/dashboard/user-info/validation.ts
import type { Editing, Errors, FormState } from "./types";

export function getTokenKeyForRoute(): 'access_token_admin' | 'access_token_user' | null {
  if (typeof window === 'undefined') return null;
  return location.pathname.startsWith('/admin') ? 'access_token_admin' : 'access_token_user';
}

export function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const key = getTokenKeyForRoute();
  if (!key) return {};
  const t = localStorage.getItem(key);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const normalizePhone = (raw: string): string => {
  if (!raw) return '';
  let s = raw.replace(/[^\d+]/g, '');
  if (s.startsWith('0')) s = '+62' + s.slice(1);
  if (!s.startsWith('+62')) s = '+62' + s.replace(/^\+?/, '');
  return s.replace(/\s+/g, '');
};

export function validateForm(editing: Editing, form: FormState): Errors {
  const newErrors: Errors = {};

  if (editing === "phone") {
    if (!form.phone_number) {
      newErrors.phone_number = "phone number is required";
    } else if (!/^\+628\d{8,15}$/.test(form.phone_number)) {
      if (!form.phone_number.startsWith("+628")) newErrors.phone_number = "phone number must start with +628";
      else if (form.phone_number.length < 10) newErrors.phone_number = "phone number is too short (min 10 chars)";
      else if (form.phone_number.length > 16) newErrors.phone_number = "phone number is too long (max 16 chars)";
      else newErrors.phone_number = "invalid Indonesian phone number format";
    }
  }

  if (editing === "password") {
    if (!form.oldPassword) newErrors.oldPassword = "old password is incorrect";
    const npw = form.newPassword ?? "";
    if (!npw) newErrors.newPassword = "password is required";
    else if (npw.length < 8) newErrors.newPassword = "password must be at least 8 characters";
    else if (npw.length > 20) newErrors.newPassword = "password must be at most 20 characters";
    else if (!/[A-Z]/.test(npw)) newErrors.newPassword = "password must include at least one uppercase letter";
    else if (!/[a-z]/.test(npw)) newErrors.newPassword = "password must include at least one lowercase letter";
    else if (!/\d/.test(npw)) newErrors.newPassword = "password must include at least one number";
    else if (!/[^A-Za-z0-9]/.test(npw)) newErrors.newPassword = "password must include at least one special character";
    else if (/(0123|1234|2345|3456|4567|5678|6789)/.test(npw)) newErrors.newPassword = "password must not contain sequential numbers";
    else {
      const lc = npw.toLowerCase();
      if (["password","qwerty","12345","123456","abc123","tanggal"].some(p=>lc.includes(p)))
        newErrors.newPassword = "password must not contain common patterns";
      if (/\b(?:\d{2}[-\/]?\d{2}[-\/]?\d{4}|\d{4}[-\/]?\d{2}[-\/]?\d{2})\b/.test(npw))
        newErrors.newPassword = "password must not contain dates";
    }

    if (!form.confirmPassword) newErrors.confirmPassword = "confirm password is required";
    else if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = "passwords do not match";
  }

  return newErrors;
}
