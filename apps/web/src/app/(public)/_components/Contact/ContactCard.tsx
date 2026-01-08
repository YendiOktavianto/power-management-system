"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import * as theme from "@/components/ui/theme";

type Props = {
  index?: number;
  name: string;
  role: string;
  img: string;
  number: string;
};

export default function ContactCard({
  index = 0,
  name,
  role,
  img,
  number,
}: Props) {
  const waHref = `https://wa.me/${number}?text=Hello%20${encodeURIComponent(
    name
  )},%20I%20would%20like%20to%20inquire%20about%20PowerSys`;

  const isOfficeOpen = (() => {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

    const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
    const minutes = hour * 60 + minute;
    const open = 9 * 60; // 09:00
    const close = 17 * 60 + 30; // 17:30
    return isWeekday && minutes >= open && minutes <= close;
  })();

  const statusColor = isOfficeOpen ? "bg-green-400" : "bg-red-500";
  const statusLabel = isOfficeOpen
    ? "Online (office hours)"
    : "Offline (outside 09:00–17:30 WIB)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 p-6 rounded-3xl shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={img}
          alt={name}
          width={96}
          height={96}
          className="rounded-full object-cover border-2 border-[#6fb6ff]/50 shadow-sm"
        />
        <span
          className={`absolute bottom-0 right-0 w-5 h-5 ${statusColor} border-2 border-[#041023] rounded-full`}
          aria-label={statusLabel}
          title={statusLabel}
        />
      </div>

      <h3 className={`text-lg font-semibold ${theme.heading}`}>
        {name}
      </h3>
      <p className={`text-sm mb-4 ${theme.body}`}>{role}</p>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium shadow-md hover:bg-[#1ebe5d] hover:shadow-lg transition"
      >
        <FaWhatsapp className="text-base" /> Chat
      </a>
    </motion.div>
  );
}
