// HeroHeading.tsx
"use client";
import { motion } from "framer-motion";

type Props = { children: React.ReactNode };

export default function HeroHeading({ children }: Props) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-4xl md:text-6xl font-bold leading-tight text-[#e6f5ff]"
    >
      {children}
    </motion.h1>
  );
}
