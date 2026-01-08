"use client";
import * as theme from "@/components/ui/theme";

type Props = {
  eyebrow: string;
  headline: string;
  body: string;
};

export default function FeaturesIntro({ eyebrow, headline, body }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-10 mb-12">
      <div>
        <span
          className={`uppercase text-xs tracking-widest font-semibold ${theme.heading}`}
        >
          {eyebrow}
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#e6f5ff] leading-snug">
          {headline}
        </h2>
      </div>
      <p
        className={`leading-relaxed text-base md:text-sm my-12 mx-12 ${theme.body}`}
      >
        {body}
      </p>
    </div>
  );
}
