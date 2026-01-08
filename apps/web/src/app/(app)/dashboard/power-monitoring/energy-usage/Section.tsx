"use client";

import React from "react";
import type { Location } from "./types";
import useEnergyUsageSection from "./useEnergyUsage";
import { needleAngleFromValue } from "./validation";
import EnergyUsageGauge from "./_components/EnergyUsageGauge";
import EnergyUsageLineChart from "./_components/EnergyUsageLineChart";
import { INFO_CARD_BG } from "@/components/ui/theme";

export default function EnergyUsageSection({
  device,
  paused,
}: {
  device?: Location;
  paused?: boolean;
}) {
  const { energyTotal, data } = useEnergyUsageSection({ device, paused });
  const needleAngle = needleAngleFromValue(energyTotal);

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <EnergyUsageGauge
          energyUsage={energyTotal}
          needleAngle={needleAngle}
        />

        {/* LINE CHART */}
        <EnergyUsageLineChart data={data} />
      </div>
    </div>
  );
}
