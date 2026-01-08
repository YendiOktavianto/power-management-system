"use client";

import React from "react";
import { START_ANGLE, END_ANGLE, ANGLE_RANGE, Y_DOMAIN, Y_TICKS } from "../constants";
import { COLOR_DANGER, COLOR_GOOD, COLOR_NEEDLE, COLOR_WARN } from "@/components/ui/theme";
import { polarToCartesian, describeArc, gaugeTickValues, angleForValue } from "../validation";

export default function CurrentGauge({
  current,
  needleAngle,
}: {
  current: number | string;
  needleAngle: number;
}) {
  return (
    <div className="flex flex-col items-center w-full md:w-1/2 bg-[#032d7a] rounded-2xl p-6">
      <svg viewBox="0 0 200 200" className="w-56 h-56">
        {/* Zones */}
        <path
          d={describeArc(100, 100, 80, -120, END_ANGLE)}
          stroke={COLOR_DANGER}
          strokeWidth="7"
          fill="none"
        />
        <path
          d={describeArc(100, 100, 80, -160, -120)}
          stroke={COLOR_WARN}
          strokeWidth="7"
          fill="none"
        />
        <path
          d={describeArc(100, 100, 80, START_ANGLE, -160)}
          stroke={COLOR_GOOD}
          strokeWidth="7"
          fill="none"
        />

        {/* Numeric ticks */}
        {gaugeTickValues(6).map((val, i) => {
          const angle =
            START_ANGLE +
            (val / (Y_DOMAIN[1] - Y_DOMAIN[0])) * ANGLE_RANGE;
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

        {/* Minor marks */}
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

        {/* Needle */}
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
        Current
      </div>
      <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">
        {current} A
      </div>
    </div>
  );
}
