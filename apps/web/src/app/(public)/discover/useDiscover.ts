"use client";

import { useEffect, useState } from "react";
import type { Features, ProductContent } from "./types";
import { FALLBACK, PRODUCT_KEY } from "./constants";
import { getApiBase, joinUrl } from "./validation";

export default function useDiscover() {
  const [isLoading, setIsLoading] = useState(true);
  const [c, setC] = useState<Features>(FALLBACK);
  const [heroBg, setHeroBg] = useState<string>("/product-hero.jpg");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const API_BASE = getApiBase();
        const url = joinUrl(
          API_BASE,
          `/api/v1/content/${encodeURIComponent(PRODUCT_KEY)}?t=${Date.now()}`
        );
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json();
        const data = (raw?.data ?? raw) as ProductContent;

        const mapped: Features = {
          hero: {
            heading: data?.hero?.title || FALLBACK.hero.heading,
            subheading: data?.hero?.subtitle || FALLBACK.hero.subheading,
            primaryCta: {
              label: data?.hero?.ctaLabel || FALLBACK.hero.primaryCta.label,
              href: FALLBACK.hero.primaryCta.href,
            },
          },
          titles: FALLBACK.titles,
          features:
            Array.isArray(data?.features) && data.features.length
              ? data.features
              : FALLBACK.features,
          steps:
            Array.isArray(data?.steps) && data.steps.length
              ? data.steps
              : FALLBACK.steps,
          benefits:
            Array.isArray(data?.benefits) && data.benefits.length
              ? data.benefits
              : FALLBACK.benefits,
          comparisons:
            Array.isArray(data?.comparisons) && data.comparisons.length
              ? data.comparisons
              : FALLBACK.comparisons,
          testimonials:
            Array.isArray(data?.testimonials) && data.testimonials.length
              ? data.testimonials
              : FALLBACK.testimonials,
        };

        if (!mounted) return;
        setC(mapped);
        setHeroBg(data?.hero?.heroImg || "/product-hero.jpg");
      } catch {
        if (!mounted) return;
        setC(FALLBACK);
        setHeroBg("/product-hero.jpg");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, c, heroBg };
}
