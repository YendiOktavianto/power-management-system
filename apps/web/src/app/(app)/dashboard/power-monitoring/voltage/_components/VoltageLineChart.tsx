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
  V_RED_YELLOW_START,
  V_YELLOW_LIME_START,
  V_LIME_YELLOW_END,
  V_YELLOW_RED_END,
} from "../constants";
import {
  GRID_STROKE,
  LINE_STROKE_GREEN,
  LINE_STROKE_RED,
  LINE_STROKE_YELLOW,
  CARD_BG,
} from "@/components/ui/theme";
import type { VoltagePoint } from "../types";

type Props = { data: VoltagePoint[] };

type VoltageStatus = "red" | "yellow" | "lime";

// mapping nilai voltage → status warna (sama range kayak gauge)
function getLegendColorForVoltage(
  v: number | undefined
): VoltageStatus {
  if (v == null || Number.isNaN(v)) return "lime";
  if (v < V_RED_YELLOW_START || v > V_YELLOW_RED_END) return "red";
  if (v < V_YELLOW_LIME_START || v > V_LIME_YELLOW_END) return "yellow";
  return "lime";
}

// pakai warna dari theme
const STROKE_COLOR_MAP: Record<VoltageStatus, string> = {
  red: LINE_STROKE_RED,       // #ff4b4b
  yellow: LINE_STROKE_YELLOW, // #ffb020
  lime: LINE_STROKE_GREEN,    // #9bff5b
};

// Tooltip custom (nggak diubah)
function VoltageTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const voltage = payload[0].value as number | undefined;
  const status = getLegendColorForVoltage(voltage);
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
        <span>{voltage}</span>
        <span style={{ marginLeft: 4, opacity: 0.8 }}>Voltage</span>
      </div>
    </div>
  );
}

export default function VoltageLineChart({ data }: Props) {
  const gradientIdStroke = "voltageStrokeGradient";
  const gradientIdFill = "voltageFillGradient";

  const lastVoltage = data.length ? data[data.length - 1].voltage : undefined;
  const lastStatus = getLegendColorForVoltage(lastVoltage);
  const strokeColor = STROKE_COLOR_MAP[lastStatus];

  return (
    <div
      className="w-full rounded-xl p-4"
      style={{ background: CARD_BG }}
    >
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {/* gradient sepanjang sumbu X, pakai 1 stop per titik */}
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
                    const status = getLegendColorForVoltage(point.voltage);
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
                    const status = getLegendColorForVoltage(point.voltage);
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
              value: "Voltage",
              angle: -90,
              position: "insideLeft",
              fill: "#fff",
              dy: 20,
            }}
          />

          <Tooltip content={<VoltageTooltip />} />

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
            dataKey="voltage"
            name="Voltage (V)"
            stroke={data.length > 0 ? `url(#${gradientIdStroke})` : strokeColor}
            fill={data.length > 0 ? `url(#${gradientIdFill})` : "none"}
            strokeWidth={2.5}   // sedikit lebih tebal biar garisnya “kelihatan”
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
