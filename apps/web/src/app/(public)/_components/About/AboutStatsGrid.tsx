"use client";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import * as theme from "@/components/ui/theme";

export type StatItem = { value: string | number; text: string };
type Props = { stats?: StatItem[] };

export default function AboutStatsGrid({ stats = [] }: Props) {
  if (!stats?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
      {stats.map((s, i) => (
        <motion.div key={i} whileHover={{ scale: 1.05 }}>
          <Card>
            <h3
              className={`text-4xl font-bold ${theme.heading}`}
            >
              {s.value}
            </h3>
            <p
              className={`text-sm mt-2 ${theme.body}`}
            >
              {s.text}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
