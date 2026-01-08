"use client";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "p-6 rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70",
        "shadow-lg border border-[#1d9bf0]/20 h-full min-h-[150px] md:min-h-[150px] flex flex-col items-center justify-center text-center",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
