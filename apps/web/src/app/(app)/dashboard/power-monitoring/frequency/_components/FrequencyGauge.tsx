"use client";

import React from "react";
import { START_ANGLE, END_ANGLE } from "../constants";
import { polarToCartesian, describeArc, angleForFreq } from "../validation";
import { COLOR_ARC, COLOR_NEEDLE } from "@/components/ui/theme";

export default function FrequencyGauge({
  frequency,
  needleAngle,
}: {
  frequency: number | string;
  needleAngle: number;
}) {
  return (
    <div className="flex flex-col items-center w-full md:w-1/2 bg-[#032d7a] rounded-2xl p-6">
      <svg viewBox="0 0 200 200" className="w-56 h-56">
        <path
          d={describeArc(100, 100, 80, START_ANGLE, END_ANGLE)}
          stroke={COLOR_ARC}
          strokeWidth="7"
          fill="none"
        />

        {[49, 50, 51].map((val, i) => {
          const angle = angleForFreq(val);
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

        {[49, 50, 51].map((val, i) => {
          const angle = angleForFreq(val);
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

      <div className="text-white px-3 py-1 rounded mt-[-81px] text-sm font-light">
        Frequency
      </div>
      <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">
        {frequency} Hz
      </div>
    </div>
  );
}
