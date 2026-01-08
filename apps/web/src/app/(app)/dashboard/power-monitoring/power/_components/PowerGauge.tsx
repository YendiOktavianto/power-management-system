"use client";

import React from "react";
import { START_ANGLE, END_ANGLE, Y_DOMAIN, Y_TICKS, ARC_LIME, ARC_RED, ARC_YELLOW } from "../constants";
import { COLOR_NEEDLE } from "@/components/ui/theme";
import { polarToCartesian, describeArc, angleForValue } from "../validation";

export default function PowerGauge({
  power,
  needleAngle,
}: {
  power: number | string;
  needleAngle: number;
}) {
  return (
    <div className="flex flex-col items-center w-full md:w-1/2 bg-[#032d7a] rounded-2xl p-6">
      <svg viewBox="0 0 200 200" className="w-56 h-56">
        {/* arc segments: urutan & warna sama */}
        <path d={describeArc(100, 100, 80, ARC_RED[0], ARC_RED[1])} stroke="red" strokeWidth="7" fill="none" />
        <path d={describeArc(100, 100, 80, ARC_YELLOW[0], ARC_YELLOW[1])} stroke="yellow" strokeWidth="7" fill="none" />
        <path d={describeArc(100, 100, 80, ARC_LIME[0], ARC_LIME[1])} stroke="lime" strokeWidth="7" fill="none" />

        {/* angka utama */}
        {Array.from({ length: 11 }).map((_, i) => {
          const val = i * (Y_DOMAIN[1] / 10);
          const angle = START_ANGLE + (i / 10) * (END_ANGLE - START_ANGLE);
          const pt = polarToCartesian(100, 100, 65, angle);
          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="8"
              fill="white"
            >
              {val}
            </text>
          );
        })}

        {/* minor ticks */}
        {Y_TICKS.map((val, i) => {
          const angle = angleForValue(val);
          const outer = polarToCartesian(100, 100, 76, angle);
          const inner = polarToCartesian(100, 100, 74, angle);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="white"
              strokeWidth={1}
            />
          );
        })}

        {/* jarum */}
        <polygon
          points={`
            ${100 + 4 * Math.cos(((needleAngle + 90) * Math.PI) / 180)},${100 + 4 * Math.sin(((needleAngle + 90) * Math.PI) / 180)}
            ${100 + 50 * Math.cos((needleAngle * Math.PI) / 180)},${100 + 50 * Math.sin((needleAngle * Math.PI) / 180)}
            ${100 + 4 * Math.cos(((needleAngle - 90) * Math.PI) / 180)},${100 + 4 * Math.sin(((needleAngle - 90) * Math.PI) / 180)}
          `}
          fill={COLOR_NEEDLE}
        />
        <circle cx="100" cy="100" r="8" fill={COLOR_NEEDLE} />
      </svg>

      <div className="text-white px-3 py-1 rounded mt-[-81px] text-sm font-light">Power</div>
      <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">{power} W</div>
    </div>
  );
}
