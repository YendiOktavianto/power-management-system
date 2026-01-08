"use client";
import { motion } from "framer-motion";
import * as theme from "@/components/ui/theme";

type Props = {
  brand?: string;
};

export default function AboutHeading({ brand = "PowerSys" }: Props) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl font-bold text-[#e6f5ff] mb-6"
    >
      About <span className={theme.heading}>{brand}</span>
    </motion.h2>
  );
}
