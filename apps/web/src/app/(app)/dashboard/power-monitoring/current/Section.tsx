"use client";

import React from "react";
import type { Location } from "./types";
import useCurrentSection from "./useCurrentSection";
import CurrentGauge from "./_components/CurrentGauge";
import CurrentLineChart from "./_components/CurrentLineChart";
import { INFO_CARD_BG} from "@/components/ui/theme";

export default function CurrentSection({ device, paused }: { device?: Location; paused?: boolean }) {
  const { current, data, needleAngle } = useCurrentSection({ device, paused });

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{ background: INFO_CARD_BG }}
    >
      {/* MAIN GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* CURRENT GAUGE */}
        <CurrentGauge current={current} needleAngle={needleAngle} />

        {/* LINE CHART */}
        <CurrentLineChart data={data} />
      </div>
    </div>
  );
}
