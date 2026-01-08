"use client";

import { motion } from "framer-motion";

import SectionShell from "@/components/features/landing/SectionShell";
import SectionCard from "@/components/features/landing/SectionCard";
import SectionHeading from "@/components/features/landing/SectionHeading";
import * as theme from "@/components/ui/theme";

type WhyItem = { title: string; desc: string };

export default function AboutWhy(props: {
  items: WhyItem[];
  heading: string;
}) {
  return (
    <SectionShell
      maxWidthClassName="max-w-6xl"
      innerClassName="md:px-12"
    >
      <SectionHeading>{props.heading}</SectionHeading>

      <div className="grid md:grid-cols-3 gap-8">
        {props.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <SectionCard className="rounded-3xl p-8">
              <h3
                className={`text-xl font-semibold mb-3 ${theme.heading}`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${theme.body}`}
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
