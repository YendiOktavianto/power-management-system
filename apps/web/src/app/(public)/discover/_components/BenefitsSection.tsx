"use client";

import { motion } from "framer-motion";
import SectionShell from "../../../../components/features/landing/SectionShell";
import SectionHeading from "../../../../components/features/landing/SectionHeading";
import SectionCard from "../../../../components/features/landing/SectionCard";
import { heading, body } from "@/components/ui/theme";

type Item = { title: string; desc: string };
type Props = { title: string; items: Item[] };

export default function BenefitsSection({ title, items }: Props) {
  return (
    <SectionShell withBg innerClassName="text-center">
      <SectionHeading>{title}</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <SectionCard className="flex flex-col gap-3">
              <h3
                className={`text-xl font-bold ${heading}`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm sm:text-base ${body}`}
              >
                {item.desc}
              </p>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
