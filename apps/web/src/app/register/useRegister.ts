"use client";

import { useEffect, useMemo, useRef } from "react";

export function useAutoHideToast(toastMessage: string | null, onClear: () => void) {
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(onClear, 3000);
    return () => clearTimeout(t);
  }, [toastMessage, onClear]);
}

export function useRegisterRefs<T extends HTMLInputElement>() {
  const email = useRef<T | null>(null);
  const username = useRef<T | null>(null);
  const password = useRef<T | null>(null);
  const confirmPassword = useRef<T | null>(null);
  return useMemo(() => ({ email, username, password, confirmPassword }), []);
}

export default {};
