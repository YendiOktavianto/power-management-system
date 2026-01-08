"use client";
import * as theme from "@/components/ui/theme";

type Props = { title: string; subtitle: string };

export default function LocationHeading({ title, subtitle }: Props) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#e6f5ff] tracking-tight">
        {title}
      </h2>
      <p
        className={`mt-4 max-w-xl mx-auto text-base ${theme.body}`}
      >
        {subtitle}
      </p>
    </div>
  );
}
