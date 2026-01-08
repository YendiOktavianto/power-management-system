"use client";

import { TABLE_HEADERS } from "../constants";
import { INFO_CARD_BG } from "@/components/ui/theme";

export type Row = {
  id: string | number;
  power: string | number;
  phase: string | number;
  cost: string | number;
  validFrom: string;
  validUntil: string;
};

export default function DataTableView({ rows }: { rows: Row[] }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-xs">
        <thead
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >
          <tr>
            {TABLE_HEADERS.map((header) => (
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
              <td colSpan={4} className="text-center py-6">
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
                <td className="px-2 py-2">{`${row.power} / ${row.phase}`}</td>
                <td className="px-2 py-2">{row.cost}</td>
                <td className="px-2 py-2">{row.validFrom}</td>
                <td className="px-2 py-2">{row.validUntil}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
