"use client";
import { motion } from "framer-motion";
import type { FeatureIconKey } from "../../types";
import { ICON_MAP } from "../../constants";
import * as theme from "@/components/ui/theme";

type Item = { title: string; desc: string; iconKey?: FeatureIconKey };

type Props = {
  item: Item;
  index?: number;
};

export default function FeatureItem({ item, index = 0 }: Props) {
  const IconNode =
    (item.iconKey && ICON_MAP[item.iconKey as FeatureIconKey]) ??
    ICON_MAP.FaBolt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      viewport={{ once: true }}
      className="flex flex-col items-start text-left"
    >
      <div className={`mb-4 ${theme.heading}`}>{IconNode}</div>
      <h3 className={`text-lg font-semibold ${theme.heading}`}>
        {item.title}
      </h3>
      <p
        className={`text-sm mt-2 mr-5 ${theme.body}`}
      >
        {item.desc}
      </p>
    </motion.div>
  );
}
