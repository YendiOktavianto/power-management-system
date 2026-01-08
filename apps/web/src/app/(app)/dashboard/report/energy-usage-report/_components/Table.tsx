// apps/web/src/app/(reports)/energy-usage/_components/Table.tsx
"use client";

import type { Row } from "../types";
import { INFO_CARD_BG } from "@/components/ui/theme";

type Props = { rows: Row[]; totals: { usage_kwh: number; usage_cost_per_day: number } };

export default function Table({ rows, totals }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-xs">
        <thead
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >
          <tr>
            {[
              "Date",
              "Start KWH",
              "End KWH",
              "Usage KWH",
              "Usage Cost KWH",
              "Usage Cost / Day (IDR)",
            ].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-4 text-left font-semibold uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6">
                No data found
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={String(row.id)}
                className={index % 2 === 0 ? "" : "bg-[#1C345C]/80"}
                style={index % 2 === 0 ? { background: INFO_CARD_BG } : undefined}
              >
                <td className="px-2 py-2">
                  {new Date(row.date).toLocaleDateString("en-GB")}
                </td>
                <td className="px-2 py-2">
                  {row.start_kwh.toLocaleString("id-ID", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td className="px-2 py-2">
                  {row.end_kwh.toLocaleString("id-ID", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td className="px-2 py-2">
                  {row.usage_kwh.toLocaleString("id-ID", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td className="px-2 py-2">
                  {row.usage_cost_kwh.toLocaleString("id-ID")}
                </td>
                <td className="px-2 py-2">
                  {row.usage_cost_per_day.toLocaleString("id-ID")}
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot
          className="sticky bottom-0 border-t border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >
          <tr className="font-semibold uppercase">
            <td className="px-2 py-3">Total</td>
            <td className="px-2 py-3">—</td>
            <td className="px-2 py-3">—</td>
            <td className="px-2 py-3">
              {totals.usage_kwh.toLocaleString("id-ID", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </td>
            <td className="px-2 py-3">—</td>
            <td className="px-2 py-3">
              {totals.usage_cost_per_day.toLocaleString("id-ID")}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
