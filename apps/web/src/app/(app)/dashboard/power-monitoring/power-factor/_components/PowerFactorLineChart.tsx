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

type Point = { time: string; powerFactor: number };

type PFStatus = "red" | "yellow" | "lime";

// mapping nilai power factor → status warna
// (silakan sesuaikan batas kalau perlu)
function getColorStatusForPF(v: number | undefined): PFStatus {
  if (v == null || Number.isNaN(v)) return "lime";
  if (v <= 0.6) return "red";      // jelek
  if (v <= 0.8) return "yellow";  // warning
  return "lime";                  // bagus
}

// warna dasar (dari theme)
const STROKE_COLOR_MAP: Record<PFStatus, string> = {
  red: LINE_STROKE_RED,
  yellow: LINE_STROKE_YELLOW,
  lime: LINE_STROKE_GREEN,
};

// Tooltip custom
function PFTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const pf = payload[0].value as number | undefined;
  const status = getColorStatusForPF(pf);
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
        <span>{pf}</span>
        <span style={{ marginLeft: 4, opacity: 0.8 }}>Power Factor</span>
      </div>
    </div>
  );
}

export default function PowerFactorLineChart({ data }: { data: Point[] }) {
  const gradientIdStroke = "pfStrokeGradient";
  const gradientIdFill = "pfFillGradient";

  const lastPF = data.length ? data[data.length - 1].powerFactor : undefined;
  const lastStatus = getColorStatusForPF(lastPF);
  const strokeColor = STROKE_COLOR_MAP[lastStatus];

  return (
    <div className="w-full rounded-xl p-4" style={{ background: CARD_BG }}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {/* gradient sepanjang sumbu X, sama kayak voltage */}
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
                    const status = getColorStatusForPF(point.powerFactor);
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
                    const status = getColorStatusForPF(point.powerFactor);
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
              value: "Power Factor",
              angle: -90,
              position: "insideLeft",
              fill: "#fff",
              dy: 40,
            }}
          />

          <Tooltip content={<PFTooltip />} />

          <Legend
            wrapperStyle={{
              fontWeight: 600,
            }}
            formatter={(value: string) => (
              <span style={{ color: strokeColor, fontWeight: 600 }}>
                {value}
              </span>
            )}
          />

          <Area
            type="monotone"
            dataKey="powerFactor"
            name="Power Factor"
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
