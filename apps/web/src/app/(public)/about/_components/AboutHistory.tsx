"use client";

import { motion } from "framer-motion";
import SectionShell from "@/components/features/landing/SectionShell";
import SectionCard from "@/components/features/landing/SectionCard";
import * as theme from "@/components/ui/theme";

export default function AboutHistory(props: { title: string; body: string }) {
  const blocks = props.body.split("\n\n");

  return (
    <SectionShell
      maxWidthClassName="max-w-6xl"
      innerClassName="md:px-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionCard className="rounded-3xl md:p-10">
          <h2 className={`text-3xl font-bold mb-6 ${theme.heading}`}>
            {props.title}
          </h2>

          <div
            className={`text-base leading-relaxed space-y-4 ${theme.body}`}
          >
            {blocks.map((blk, i) => (
              <p key={i}>{blk}</p>
            ))}
          </div>
        </SectionCard>
      </motion.div>
    </SectionShell>
  );
}
