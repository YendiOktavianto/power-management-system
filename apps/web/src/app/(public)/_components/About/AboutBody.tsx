"use client";
import { FALLBACK } from "../../constants";
import * as theme from "@/components/ui/theme";

type Props = {
  body?: string;
};

export default function AboutBody({ body }: Props) {
  return (
    <p
      className={`max-w-3xl mx-auto leading-relaxed mb-8 ${theme.body}`}
    >
      {body || FALLBACK.about.body}
    </p>
  );
}
