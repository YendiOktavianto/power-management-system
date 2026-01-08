"use client";

export default function SidebarLogo() {
  return (
    <>
      <h1 className="flex items-center gap-2 text-base font-bold text-white mb-1">
        <img src="/logo2.svg" alt="logo" className="w-80" />
      </h1>
      <img src="/line.svg" alt="line" className="w-60 h-6 mb-2" />
    </>
  );
}
