"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#041225]/90 to-[#021026]/90 backdrop-blur-md border-b border-[#0f2a4d]/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="logo2.svg" alt="logo" width={200} className="md:w-[240px]" />
          </Link>
          <div className="flex items-center gap-3 text-sm md:hidden">
            <Link href="/login" className="py-2 px-2 rounded-xl hover:text-[#6fb6ff] transition font-medium">
              Login
            </Link>
            <Link href="/register" className="px-3 py-2 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] transition font-medium">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Menu: wrap di mobile, baris tunggal di desktop */}
        <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          <nav className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-8 text-sm">
            <Link href="/#about" className="hover:text-[#6fb6ff] transition">About</Link>
            <Link href="/#features" className="hover:text-[#6fb6ff] transition">Features</Link>
            <Link href="/#team" className="hover:text-[#6fb6ff] transition">Team</Link>
            <Link href="/#contact" className="hover:text-[#6fb6ff] transition">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link href="/login" className="py-2 rounded-xl hover:text-[#6fb6ff] transition font-medium">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] transition font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
