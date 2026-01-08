"use client";

import React from "react";
import type { Location } from "./types";
import useVoltageSection from "./useVoltage";
import { needleAngleFromValue } from "./validation";
import VoltageGauge from "./_components/VoltageGauge";
import VoltageLineChart from "./_components/VoltageLineChart";
import { INFO_CARD_BG} from "@/components/ui/theme";

export default function VoltageSection({ device, paused }: { device?: Location; paused?: boolean }) {
  const { voltage, data } = useVoltageSection({ device, paused });
  const needleAngle = needleAngleFromValue(voltage);

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      {/* VOLTAGE GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <VoltageGauge voltage={voltage} needleAngle={needleAngle} />

        {/* AREA CHART */}
        <VoltageLineChart data={data} />
      </div>
    </div>
  );
}
