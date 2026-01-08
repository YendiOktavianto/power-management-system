"use client";
import { motion } from "framer-motion";

export default function HeroShapes() {
  return (
    <>
      <motion.div
        className="absolute top-10 left-10 w-40 h-40 bg-[#6fb6ff]/10 rounded-full -z-0"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-60 h-60 bg-[#1d9bf0]/10 rounded-full -z-0"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </>
  );
}
