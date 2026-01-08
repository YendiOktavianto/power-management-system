"use client";

import React from "react";
import type { Location } from "./types";
import usePowerFactorSection from "./usePowerFactor";
import { needleAngleFromPF } from "./validation";
import PowerFactorGauge from "./_components/PowerFactorGauge";
import PowerFactorLineChart from "./_components/PowerFactorLineChart";
import { INFO_CARD_BG} from "@/components/ui/theme";

export default function PowerFactorSection({
  device,
  paused,
}: { device?: Location; paused?: boolean }) {
  const { powerFactor, data } = usePowerFactorSection({ device, paused });
  const needleAngle = needleAngleFromPF(powerFactor);

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      {/* GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <PowerFactorGauge powerFactor={powerFactor} needleAngle={needleAngle} />

        {/* LINE CHART */}
        <PowerFactorLineChart data={data} />
      </div>
    </div>
  );
}
