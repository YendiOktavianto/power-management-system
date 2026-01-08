"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Content, WhyItem, LoPItem } from "./types";
import { FALLBACK } from "./constants";
import { isLoPArray, isWhyArray, strOr, PartialContent } from "./validation";

function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  return base.replace(/\/+$/, "");
}
function joinUrl(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function mergeContent(partial?: PartialContent): Content {
  const d = partial ?? {};

  return {
    hero: {
      title: strOr(FALLBACK.hero.title, d.hero?.title),
      subtitle: strOr(FALLBACK.hero.subtitle, d.hero?.subtitle),
      heroImg: strOr(FALLBACK.hero.heroImg, d.hero?.heroImg),
    },
    history: {
      title: strOr(FALLBACK.history.title, d.history?.title),
      body: strOr(FALLBACK.history.body, d.history?.body),
    },
    vision: {
      title: strOr(FALLBACK.vision.title, d.vision?.title),
      body: strOr(FALLBACK.vision.body, d.vision?.body),
    },
    mission: {
      title: strOr(FALLBACK.mission.title, d.mission?.title),
      body: strOr(FALLBACK.mission.body, d.mission?.body),
    },
    why: isWhyArray(d.why) && d.why.length ? (d.why as WhyItem[]) : FALLBACK.why,
    lineOfProducts:
      isLoPArray(d.lineOfProducts) && d.lineOfProducts.length
        ? (d.lineOfProducts as LoPItem[])
        : FALLBACK.lineOfProducts,
  };
}

export default function useAbout() {
  const [c, setC] = useState<Content>(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError("");

    try {
      const API_BASE = getApiBase();
      const bust = process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : "";
      const url = joinUrl(API_BASE, `/api/v1/content/company${bust}`);

      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = (json?.data ?? json) as PartialContent;

      setC(mergeContent(data));
    } catch (e: any) {
      if (e?.name === "AbortError") return; 
      setC(FALLBACK);
      setError(e?.message ?? "Failed to load content");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return {
    c,
    setC,        
    isLoading,
    error,
    refresh: fetchData,
  };
}
