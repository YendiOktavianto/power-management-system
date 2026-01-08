"use client";
import Image from "next/image";
import clsx from "clsx";
import type { ReactNode } from "react";

type Align = "left" | "center" | "right";
type Size = "sm" | "md" | "lg";

type ImageProps = {
  src: string;
  alt: string;
  width?: number;  
  height?: number; 
  className?: string;
  priority?: boolean;
};

type Props = {
  title: string;
  subtitle?: ReactNode;
  align?: Align;  
  size?: Size;    
  image?: ImageProps;
  className?: string;
  eyebrow?: ReactNode;
};

const sizeMap = {
  sm: { h: "text-xl", p: "text-xs" },
  md: { h: "text-2xl", p: "text-sm" },
  lg: { h: "text-3xl", p: "text-base" },
};

export default function AuthSectionHeader({
  title,
  subtitle,
  eyebrow,
  align = "center",
  size = "md",
  image,
  className,
}: Props) {
  const sz = sizeMap[size];
  const alignCls =
    align === "center" ? "text-center"
    : align === "right" ? "text-right"
    : "text-left";

  return (
    <header className={clsx("mb-6", alignCls, className)}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width ?? 200}
          height={image.height ?? 200}
          priority={image.priority}
          className={clsx("mb-4 mx-auto", image.className)}
        />
      ) : null}

      {eyebrow ? (
        <p className={clsx("mb-1 text-white/70", sz.p)}>{eyebrow}</p>
      ) : null}

      <h1 className={clsx("font-bold text-white mb-2", sz.h)}>{title}</h1>

      {subtitle ? (
        <p className={clsx("font-light text-white/90", sz.p)}>{subtitle}</p>
      ) : null}
    </header>
  );
}
