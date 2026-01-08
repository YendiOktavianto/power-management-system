"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import SectionShell from "../../../../components/features/landing/SectionShell";
import SectionHeading from "../../../../components/features/landing/SectionHeading";
import SectionCard from "../../../../components/features/landing/SectionCard";
import { accent, heading, body } from "@/components/ui/theme";

type Item = { title: string; desc: string; img?: string };
type Props = { title: string; items: Item[] };

export default function FeaturesSection({ title, items }: Props) {
  return (
    <SectionShell id="features" withBg>
      <SectionHeading>{title}</SectionHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <SectionCard className="flex flex-col gap-3">
              <CheckCircle
                size={28}
                className={accent}
              />
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
              {item.img && (
                <img
                  src={item.img}
                  alt={item.title}
                  className="mt-4 rounded-xl border border-[#0d3f70]"
                />
              )}
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
