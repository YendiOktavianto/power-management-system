"use client";

import { Row } from "../types";
import { INFO_CARD_BG } from "@/components/ui/theme";

export default function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-xs">
        <thead
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >
          <tr>
            {[
              "Data ID",
              "Date",
              "Time",
              "Voltage (V)",
              "Current (A)",
              "Frequency (Hz)",
              "Cos (φ)",
              "Power (W)",
            ].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-4 text-left font-semibold uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-3">
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
                <td className="px-2 py-2">{row.id}</td>
                <td className="px-2 py-2">{row.date}</td>
                <td className="px-2 py-2">{row.time}</td>
                <td className="px-2 py-2">{row.voltage}</td>
                <td className="px-2 py-2">{row.current}</td>
                <td className="px-2 py-2">{row.frequency}</td>
                <td className="px-2 py-2">{row.cos}</td>
                <td className="px-2 py-2">{row.power}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
