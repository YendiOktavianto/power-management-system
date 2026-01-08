"use client";

import React from "react";
import type { Location } from "./types";
import usePowerSection from "./usePower";
import { needleAngleFromValue } from "./validation";
import PowerGauge from "./_components/PowerGauge";
import PowerLineChart from "./_components/PowerLineChart";
import { INFO_CARD_BG} from "@/components/ui/theme";

export default function PowerSection({
  device,
  paused,
}: { device?: Location; paused?: boolean }) {
  const { power, data } = usePowerSection({ device, paused });
  const needleAngle = needleAngleFromValue(power);

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      {/* GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <PowerGauge power={power} needleAngle={needleAngle} />

        {/* LINE CHART */}
        <PowerLineChart data={data} />
      </div>
    </div>
  );
}
