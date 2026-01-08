"use client";

import type { Request, HandleAction } from "../types";
import { INFO_CARD_BG, panding, approve, reject } from "@/components/ui/theme";
import Button from "@/components/ui/Button";

type RequestRow = Request;

export default function RequestsTable({
  rows,
  loading,
  handleAction,
  rowNumber,
}: {
  rows: RequestRow[];
  loading: boolean;
  handleAction: HandleAction;
  rowNumber: (index: number) => number | string;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-xs">
        <thead
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >
          <tr>
            {[
              "NO",
              "Username",
              "Address",
              "Segmen",
              "Detail_Location",
              "Coordinate",
              "Status",
              "Action",
            ].map((header) => (
              <th
                key={header}
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
              <td colSpan={8} className="text-center py-6">
                No data found
              </td>
            </tr>
          ) : (
            rows.map((r, index) => (
              <tr
                key={String(r.id)}
                className={index % 2 === 0 ? "" : "bg-[#1C345C]/80"}
                style={index % 2 === 0 ? { background: INFO_CARD_BG } : undefined}
              >
                <td className="px-2 py-2">{rowNumber(index)}</td>
                <td className="px-2 py-2">{r.username || "-"}</td>
                <td className="px-2 py-2">{r.address}</td>
                <td className="px-2 py-2">{r.segmen || "-"}</td>
                <td className="px-2 py-2">{r.detail_address || "-"}</td>
                <td className="px-2 py-2">
                  {r.lat?.toFixed ? r.lat.toFixed(5) : r.lat},{" "}
                  {r.lng?.toFixed ? r.lng.toFixed(5) : r.lng}
                </td>
                <td className="px-2 py-2">
                  <span
                    className={
                      r.status === "pending"
                        ? panding
                        : r.status === "approved"
                        ? approve
                        : reject
                    }
                  >
                    {r.status?.toUpperCase?.() || "pending"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  {r.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        label="Approve"
                        disabled={loading}
                        variant="info"
                        size="xs"
                        radius="sm"
                        onClick={() => {
                          localStorage.setItem(
                            "prefillDeviceData",
                            JSON.stringify(r),
                          );
                          window.location.href = "/admin/device-management";
                        }}
                      />
                      <Button
                        label="Reject"
                        disabled={loading}
                        variant="danger"
                        size="xs"
                        radius="sm"
                        onClick={() => handleAction(r.id, "rejected")}
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
