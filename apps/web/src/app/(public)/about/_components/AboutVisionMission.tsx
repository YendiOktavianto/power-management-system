"use client";

import { motion } from "framer-motion";

import SectionShell from "@/components/features/landing/SectionShell";
import SectionCard from "@/components/features/landing/SectionCard";
import * as theme from "@/components/ui/theme";

export default function AboutVisionMission(props: {
  vision: { title: string; body: string };
  mission: { title: string; body: string };
}) {
  return (
    <SectionShell
      maxWidthClassName="max-w-6xl"
      innerClassName="md:px-12"
    >
      <div className="grid md:grid-cols-2 gap-10">
        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <SectionCard className="rounded-3xl md:p-10">
            <h3
              className={`text-2xl font-bold mb-4 ${theme.heading}`}
            >
              {props.vision.title}
            </h3>
            <p
              className={`leading-relaxed ${theme.body}`}
            >
              {props.vision.body}
            </p>
          </SectionCard>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <SectionCard className="rounded-3xl md:p-10">
            <h3
              className={`text-2xl font-bold mb-4 ${theme.heading}`}
            >
              {props.mission.title}
            </h3>
            <p
              className={`leading-relaxed ${theme.body}`}
            >
              {props.mission.body}
            </p>
          </SectionCard>
        </motion.div>
      </div>
    </SectionShell>
  );
}
