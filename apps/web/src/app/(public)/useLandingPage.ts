"use client";

import { useEffect, useState } from "react";
import type { Content } from "./types";
import { FALLBACK } from "./constants";
import { normalizeContent } from "./validation";

export function useLandingPage() {
  const [bootLoading, setBootLoading] = useState(true);
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 1200);
    (async () => {
      try {
        const res = await fetch("/api/content/landing", { cache: "no-store" });
        if (!res.ok) throw new Error("content not found");
        const json = await normalizeContent(res);
        setContent(json);
      } catch {
        setContent(FALLBACK);
      }
    })();
    return () => clearTimeout(t);
  }, []);

  return { bootLoading, content };
}

export default useLandingPage;
