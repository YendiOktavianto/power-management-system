"use client";

import { motion } from "framer-motion";
import SectionShell from "../../../../components/features/landing/SectionShell";
import SectionHeading from "../../../../components/features/landing/SectionHeading";
import SectionCard from "../../../../components/features/landing/SectionCard";
import { accent, heading, body } from "@/components/ui/theme";


type Step = { title: string; desc: string };
type Props = { title: string; steps: Step[] };

export default function WorkflowSection({ title, steps }: Props) {
  return (
    <SectionShell
      maxWidthClassName="max-w-4xl"
      // tidak pakai bg, sama seperti kode awal
    >
      <SectionHeading>{title}</SectionHeading>

      <div className="flex flex-col gap-8">
        {steps.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: i * 0.2 }}
          >
            <SectionCard className="sm:flex-row items-start gap-6">
              <div
                className={`font-bold text-2xl sm:text-3xl ${accent}`}
              >
                {i + 1}
              </div>
              <div>
                <h4
                  className={`text-lg sm:text-xl md:text-2xl font-semibold ${heading}`}
                >
                  {item.title}
                </h4>
                <p
                  className={`mt-2 text-sm sm:text-base md:text-base ${body}`}
                >
                  {item.desc}
                </p>
              </div>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
