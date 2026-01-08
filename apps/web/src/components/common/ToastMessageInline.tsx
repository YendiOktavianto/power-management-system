"use client";
import type { ToastData } from "./hooks/useToastMessage";

export default function ToastInline({
  toast,
  onClose,
  placement = "top-center",
}: {
  toast: ToastData;
  onClose: () => void;
  placement?: "top-center" | "bottom-right";
}) {
  if (!toast.open) return null;

  const color =
    toast.kind === "success" ? "bg-green-600" : toast.kind === "error" ? "bg-red-600" : toast.kind === "danger"  ? "bg-yellow-700" : "bg-blue-600";
  const pos =
    placement === "top-center" ? "fixed top-6 left-1/2 -translate-x-1/2" : "fixed right-4 bottom-4";

  return (
    <div className={`${pos} z-[9999] pointer-events-auto animate-[toastFade_5s_ease]`} role="status" aria-live="polite" onClick={onClose}>
      <div className={`${color} text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-3`}>
        <span className="text-base">
          {toast.kind === "success" ? "✅" : toast.kind === "error" ? "❌" : toast.kind === "danger"  ? "⚠️" : "ℹ️"}
        </span>
        <div className="min-w-0">
          <div className="font-medium truncate">{toast.title}</div>
          {toast.desc ? <div className="opacity-90 text-[12.5px] mt-0.5 line-clamp-2">{toast.desc}</div> : null}
        </div>
      </div>
      <style jsx global>{`
        @keyframes toastFade {
          0% { opacity: 0; transform: translateY(-6px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
