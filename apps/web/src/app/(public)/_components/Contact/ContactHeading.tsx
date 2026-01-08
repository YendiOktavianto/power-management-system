"use client";
import * as theme from "@/components/ui/theme";

type Props = { title: string; subtitle: string };

export default function ContactHeading({ title, subtitle }: Props) {
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#e6f5ff] mb-4">
        {title}
      </h2>
      <p
        className={`mb-12 max-w-2xl mx-auto text-center ${theme.body}`}
      >
        {subtitle}
      </p>
    </>
  );
}
