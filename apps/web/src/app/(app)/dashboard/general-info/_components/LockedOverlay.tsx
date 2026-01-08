"use client";
export default function LockedOverlay({ subtle = false }: { subtle?: boolean }) {
  return (
    <div
      className={`absolute inset-0 rounded-2xl ${
        subtle ? "bg-black/0" : "bg-black/0"
      } border border-white/10 flex items-center justify-center z-10`}
    />
  );
}
