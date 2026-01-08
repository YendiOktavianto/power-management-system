"use client";

import { motion } from "framer-motion";
import * as theme from "@/components/ui/theme";

export default function AboutHero(props: {
  title: string;
  subtitle: string;
  heroImg?: string;
}) {
  const titleText = props.title || "PT Innotech Global Solusindo";

  return (
    <section
      className="relative py-40 px-6 md:px-12 text-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${props.heroImg || "/company.png"}')` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-4xl md:text-6xl font-bold text-[#e6f5ff]"
      >
        About{" "}
        <span className={theme.heading}>
          {titleText}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`relative mt-6 max-w-3xl mx-auto leading-relaxed ${theme.body}`}
      >
        {props.subtitle}
      </motion.p>
    </section>
  );
}
