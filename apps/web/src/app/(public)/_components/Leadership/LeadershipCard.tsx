"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import * as theme from "@/components/ui/theme";

type Props = {
  name: string;
  role: string;
  img: string;
  index?: number;
};

export default function LeadershipCard({
  name,
  role,
  img,
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{
        boxShadow: "0px 0px 25px rgba(111,182,255,0.6)",
        borderColor: "#6fb6ff",
      }}
      className="bg-gradient-to-br from-[#072b56]/80 to-[#041023]/80 rounded-2xl p-6 shadow-lg shadow-blue-900/40 border border-[#1d9bf0]/20 transition-all duration-300 text-center"
    >
      <Image
        src={img}
        alt={name}
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-[#6fb6ff]/40"
      />
      <h3 className={`text-lg font-semibold ${theme.heading}`}>
        {name}
      </h3>
      <p className={`text-sm mt-2 ${theme.body}`}>{role}</p>
    </motion.div>
  );
}
