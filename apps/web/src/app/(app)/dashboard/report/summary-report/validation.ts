/** Memanggil native picker (Chrome/Edge) */
export const openPicker = (el: HTMLInputElement | null) => {
  try {
    if (el && typeof (el as any).showPicker === "function") {
      (el as any).showPicker();
      return;
    }
  } catch {
    // ignore error "requires a user gesture"
  }

  // fallback: minimal fokus ke inputnya
  if (el) {
    el.focus();
  }
};
