"use client";
import { MapPin, Clock, Phone } from "lucide-react";
import Button from "@/app/(public)/_components/ui/Button";
import { motion } from "framer-motion";
import * as theme from "@/components/ui/theme";

type Cta = { href: string; label: string };
type Props = {
  hqTitle: string;
  address: string;
  hours: string;
  phone: string;
  mapsUrl: string;
  primary?: Cta;
  ctaLabel?: string;
};

export default function LocationInfo({
  hqTitle,
  address,
  hours,
  phone,
  mapsUrl,
  primary,
  ctaLabel,
}: Props) {
  const mainCta: Cta =
    primary ?? { href: mapsUrl, label: ctaLabel ?? "Open Google Maps" };

  return (
    <div className="rounded-2xl p-8">
      <h3
        className={`text-2xl font-semibold mb-6 ${theme.heading}`}
      >
        {hqTitle}
      </h3>
      <ul
        className={`space-y-5 text-sm md:text-base leading-relaxed ${theme.body}`}
      >
        <li className="flex items-start gap-3 text-sm">
          <MapPin className={`w-5 h-5 mt-0.5 ${theme.accent}`} />
          {address}
        </li>
        <li className="flex items-start gap-3 text-sm">
          <Clock className={`w-5 h-5 mt-0.5 ${theme.accent}`} />
          {hours}
        </li>
        <li className="flex items-start gap-3 text-sm">
          <Phone className={`w-5 h-5 mt-0.5 ${theme.accent}`} />
          {phone}
        </li>
      </ul>

      <motion.div whileHover={{ scale: 1.05 }} className="mt-8">
        <Button
          as="a"
          href={mainCta.href}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary2"
          size="md"
          aria-label={ctaLabel ?? `Open ${hqTitle} in Google Maps`}
        >
          {mainCta.label}
        </Button>
      </motion.div>

    </div>
  );
}
