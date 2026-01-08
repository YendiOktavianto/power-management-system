"use client";

import { motion } from "framer-motion";
import Button from "@/app/(public)/_components/ui/Button";
import { heading, body } from "@/components/ui/theme";
import Link from "next/link";

type Cta = { href?: string; label?: string };

type Props = {
  heading: string;
  subheading: string;
  primary?: Cta;
  ctaLabel?: string;
  heroBg?: string;
};

export default function Hero({
  heading,
  subheading,
  primary,
  ctaLabel,
  heroBg,
}: Props) {
  const mainCta: Required<Cta> = {
    href: primary?.href ?? "/register",
    label: primary?.label ?? ctaLabel ?? "Get Started",
  };
  const bg = heroBg ?? "/product-hero.jpg";

  return (
    <section className="relative h-[100vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url('${bg}')` }}
      />

      {/* Animated shapes */}
      <motion.div
        aria-hidden="true"
        className="absolute top-10 left-10 -z-0"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 24 24"
          fill="#6fb6ff20"
          className="w-40 h-40"
        >
          <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
        </svg>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-20 right-20 -z-0"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <svg
          width="500"
          height="500"
          viewBox="0 0 24 24"
          fill="#1d9bf020"
          className="w-60 h-60"
        >
          <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-snug ${heading}`}
      >
        {heading}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`relative mt-4 sm:mt-6 max-w-2xl sm:max-w-3xl text-base sm:text-lg md:text-xl ${body}`}
      >
        {subheading}
      </motion.p>

      <motion.div
        className="mt-6 relative z-10"
        whileHover={{ scale: 1.05 }}
      >
        <Link href={mainCta.href!}>
          <Button variant="primary" size="lg">
            {mainCta.label}
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
