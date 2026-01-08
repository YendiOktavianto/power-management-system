// HeroSubheading.tsx
"use client";
import { motion } from "framer-motion";
import * as theme from "@/components/ui/theme";

type Props = { children: React.ReactNode };

export default function HeroSubheading({ children }: Props) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className={`mt-6 max-w-2xl mx-auto ${theme.body}`}
    >
      {children}
    </motion.p>
  );
}
