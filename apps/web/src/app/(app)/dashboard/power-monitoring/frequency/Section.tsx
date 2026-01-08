"use client";

import React from "react";
import type { Location } from "./types";
import useFrequencySection from "./useFrequency";
import { needleAngleFromFreq } from "./validation";
import FrequencyGauge from "./_components/FrequencyGauge";
import FrequencyLineChart from "./_components/FrequencyLineChart";
import { INFO_CARD_BG} from "@/components/ui/theme";

export default function FrequencySection({
  device,
  paused,
}: { device?: Location; paused?: boolean }) {
  const { frequency, data } = useFrequencySection({ device, paused });
  const needleAngle = needleAngleFromFreq(frequency);

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      {/* GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <FrequencyGauge frequency={frequency} needleAngle={needleAngle} />

        {/* LINE CHART */}
        <FrequencyLineChart data={data} />
      </div>
    </div>
  );
}
