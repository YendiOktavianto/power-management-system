"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "../ui/Button";

type Cta = { href?: string; label?: string };
export default function HeroCtas({
  primary = { href: "/register", label: "Experience It Now" },
  secondary = { href: "/discover", label: "Discover More Features" },
}: { primary?: Cta; secondary?: Cta }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="mt-8 flex justify-center gap-4"
    >
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link href={primary.href!}>
          <Button variant="primary" size="lg">
            {primary.label}
          </Button>
        </Link>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }}>
        <Link href={secondary.href!}>
          <Button variant="secondary" size="lg">
            {secondary.label}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
