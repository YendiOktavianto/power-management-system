"use client";

import { motion } from "framer-motion";
import SectionShell from "@/components/features/landing/SectionShell";
import SectionCard from "@/components/features/landing/SectionCard";
import SectionHeading from "@/components/features/landing/SectionHeading";
import * as theme from "@/components/ui/theme";

type LoPItem = { title: string; icon: string };

export default function AboutProducts(props: {
  items: LoPItem[];
  heading: string;
}) {
  return (
    <SectionShell
      maxWidthClassName="max-w-7xl"
      innerClassName="md:px-12"
    >
      <SectionHeading>{props.heading}</SectionHeading>

      <div className="grid md:grid-cols-3 gap-10">
        {props.items.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <SectionCard className="text-start cursor-pointer transition-transform duration-300 hover:scale-[1.05]">
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3
                className={`text-lg font-semibold ${theme.heading}`}
              >
                {p.title}
              </h3>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
