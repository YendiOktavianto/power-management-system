"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Y_DOMAIN, Y_TICKS } from "../constants";
import {
  GRID_STROKE,
  LINE_STROKE_GREEN,
  LINE_STROKE_YELLOW,
  LINE_STROKE_RED,
  CARD_BG,
} from "@/components/ui/theme";

type Point = { time: string; power: number };

type PowerStatus = "red" | "yellow" | "lime";

// mapping nilai power → status warna
// (pakai batas proporsional dari Y_DOMAIN)
function getColorStatusForPower(v: number | undefined): PowerStatus {
  if (v == null || Number.isNaN(v)) return "lime";
  if (v <= 2400) return "lime";      // jelek
  if (v <= 3300) return "yellow";  // warning
  return "red";                  // bagus
}

const STROKE_COLOR_MAP: Record<PowerStatus, string> = {
  red: LINE_STROKE_RED,
  yellow: LINE_STROKE_YELLOW,
  lime: LINE_STROKE_GREEN,
};

// Tooltip custom
function PowerTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const power = payload[0].value as number | undefined;
  const status = getColorStatusForPower(power);
  const color = STROKE_COLOR_MAP[status];

  return (
    <div
      style={{
        backgroundColor: "#0C1F3C",
        borderRadius: 8,
        border: "1px solid #333",
        color: "#fff",
        padding: "8px 10px",
        fontWeight: 500,
        fontSize: 16,
      }}
    >
      <div style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "999px",
            backgroundColor: color,
          }}
        />
        <span>{power}</span>
        <span style={{ marginLeft: 4, opacity: 0.8 }}>Power</span>
      </div>
    </div>
  );
}

export default function PowerLineChart({ data }: { data: Point[] }) {
  const gradientIdStroke = "powerStrokeGradient";
  const gradientIdFill = "powerFillGradient";

  const lastPower = data.length ? data[data.length - 1].power : undefined;
  const lastStatus = getColorStatusForPower(lastPower);
  const strokeColor = STROKE_COLOR_MAP[lastStatus];

  return (
    <div className="w-full rounded-xl p-4" style={{ background: CARD_BG }}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {/* gradient sepanjang sumbu X */}
          <defs>
            {data.length > 0 && (
              <>
                {/* GRADIENT GARIS */}
                <linearGradient
                  id={gradientIdStroke}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  {data.map((point, idx) => {
                    const status = getColorStatusForPower(point.power);
                    const color = STROKE_COLOR_MAP[status];
                    const offset =
                      data.length === 1
                        ? 0
                        : (idx / (data.length - 1)) * 100;
                    return (
                      <stop
                        key={`stroke-${idx}`}
                        offset={`${offset}%`}
                        stopColor={color}
                        stopOpacity={1}
                      />
                    );
                  })}
                </linearGradient>

                {/* GRADIENT AREA */}
                <linearGradient
                  id={gradientIdFill}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  {data.map((point, idx) => {
                    const status = getColorStatusForPower(point.power);
                    const color = STROKE_COLOR_MAP[status];
                    const offset =
                      data.length === 1
                        ? 0
                        : (idx / (data.length - 1)) * 100;
                    return (
                      <stop
                        key={`fill-${idx}`}
                        offset={`${offset}%`}
                        stopColor={color}
                        stopOpacity={0.25}
                      />
                    );
                  })}
                </linearGradient>
              </>
            )}
          </defs>

          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
          <YAxis
            domain={Y_DOMAIN}
            ticks={Y_TICKS}
            tick={{ fill: "#fff", fontSize: 9 }}
            label={{
              value: "Power",
              angle: -90,
              position: "insideLeft",
              fill: "#fff",
              dy: 20,
            }}
          />

          <Tooltip content={<PowerTooltip />} />

          <Legend
            wrapperStyle={{ fontWeight: 600 }}
            formatter={(value: string) => (
              <span style={{ color: strokeColor, fontWeight: 600 }}>
                {value}
              </span>
            )}
          />

          <Area
            type="monotone"
            dataKey="power"
            name="Power (Watt)"
            stroke={data.length > 0 ? `url(#${gradientIdStroke})` : strokeColor}
            fill={data.length > 0 ? `url(#${gradientIdFill})` : "none"}
            strokeWidth={2.5}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
