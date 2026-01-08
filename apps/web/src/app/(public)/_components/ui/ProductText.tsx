"use client";
import * as theme from "@/components/ui/theme";

export default function ProductText({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex-1 text-left text-sm">
      <h3
        className={`text-5xl font-semibold mb-6 ${theme.heading}`}
      >
        {title}
      </h3>
      <p className={`mt-4 text-sm ${theme.body}`}>{body}</p>
    </div>
  );
}
