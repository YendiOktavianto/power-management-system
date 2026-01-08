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
import {
  Y_DOMAIN,
  Y_TICKS,
  CURRENT_LIME_MAX,
  CURRENT_YELLOW_MAX,
} from "../constants";
import {
  GRID_STROKE,
  LINE_STROKE_GREEN,
  LINE_STROKE_YELLOW,
  LINE_STROKE_RED,
  CARD_BG,
} from "@/components/ui/theme";

type Point = { time: string; current: number | null };

type CurrentStatus = "red" | "yellow" | "lime";

// mapping nilai current → status warna (ikut range gauge)
function getLegendColorForCurrent(
  v: number | undefined | null
): CurrentStatus {
  if (v == null || Number.isNaN(v)) return "lime";
  if (v <= 13) return "lime";      // normal
  if (v <= 20) return "yellow";  // warning
  return "red";                                  // tinggi
}

function getColorStatusForCurrent(v: number | undefined | null):CurrentStatus {
  if (v == null || Number.isNaN(v)) return "lime";
  if (v <= 13) return "lime";      // jelek
  if (v <= 20) return "yellow";  // warning
  return "red";                  // bagus
}

// pakai warna dari theme
const STROKE_COLOR_MAP: Record<CurrentStatus, string> = {
  red: LINE_STROKE_RED,
  yellow: LINE_STROKE_YELLOW,
  lime: LINE_STROKE_GREEN,
};

// Tooltip custom mirip VoltageTooltip
function CurrentTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const current = payload[0].value as number | undefined;
  const status = getLegendColorForCurrent(current);
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
        <span>{current}</span>
        <span style={{ marginLeft: 4, opacity: 0.8 }}>Current</span>
      </div>
    </div>
  );
}

export default function CurrentLineChart({ data }: { data: Point[] }) {
  const gradientIdStroke = "currentStrokeGradient";
  const gradientIdFill = "currentFillGradient";

  const lastCurrent =
    data && data.length ? data[data.length - 1].current : undefined;
  const lastStatus = getLegendColorForCurrent(lastCurrent);
  const strokeColor = STROKE_COLOR_MAP[lastStatus];

  return (
    <div
      className="w-full rounded-xl p-4"
      style={{ background: CARD_BG }}
    >
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 30 }}
        >
          {/* gradient sepanjang sumbu X, 1 stop per titik data */}
          <defs>
            {data.length > 0 && (
              <>
                {/* GRADIENT UNTUK GARIS */}
                <linearGradient
                  id={gradientIdStroke}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  {data.map((point, idx) => {
                    const status = getLegendColorForCurrent(point.current);
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

                {/* GRADIENT UNTUK AREA */}
                <linearGradient
                  id={gradientIdFill}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  {data.map((point, idx) => {
                    const status = getLegendColorForCurrent(point.current);
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
            tick={{ fill: "#fff", fontSize: 10 }}
            label={{
              value: "Current",
              angle: -90,
              position: "insideLeft",
              fill: "#fff",
              dy: 30,
            }}
          />

          <Tooltip content={<CurrentTooltip />} />

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
            dataKey="current"
            name="Current (Ampere)"
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
