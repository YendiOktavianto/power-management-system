"use client";

import React from "react";
import { INFO_CARD_BG, BTN } from "@/components/ui/theme";
import type { Request } from "../types";
import { FaTrash } from "react-icons/fa";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export default function HistorySection({
  history,
  fmtTime,
  shortText,
  statusBadgeClass,
  onRefresh,
  loadingHistory,
  onAskDelete,
  deletingId,
}: {
  history: Request[];
  fmtTime: (n: number) => string;
  shortText: (s: string, n?: number) => string;
  statusBadgeClass: (s: string) => string;
  onRefresh: () => void;
  loadingHistory: boolean;
  onAskDelete: (r: Request) => void;
  deletingId: number | null;
}) {
  return (
    <section
      className="mt-4 rounded-2xl border border-white/10 backdrop-blur-md p-4 max-w-6xl w-full mx-auto shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
      style={{ background: INFO_CARD_BG }}
      aria-label="Request history"
    >  
      <div className="flex items-center justify-between mb-3">
      <PageHeader 
        title="Request History"
        align="left"
      />
        <div>
          <Button label={loadingHistory ? "Refreshing..." : "Refresh"} variant="secondary"  size="md" onClick={onRefresh} radius="full">  
          </Button>
        </div>  
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-white/70">No requests yet</p>
      ) : (
        <div className="overflow-x-auto max-h-[42vh] overflow-y-auto pr-1 rounded-xl ring-1 ring-white/10">
          <table className="min-w-full text-xs text-left">
            <thead className="sticky top-0 z-10" style={{ background: INFO_CARD_BG }}>
              <tr className="text-white/70 border-b border-white/10">
                <th className="py-2 pr-3 font-medium" scope="col">#</th>
                <th className="py-2 pr-3 font-medium" scope="col">Address</th>
                <th className="py-2 pr-3 font-medium" scope="col">Segment</th>
                <th className="py-2 pr-3 font-medium" scope="col">Status</th>
                <th className="py-2 pr-3 font-medium" scope="col">Time</th>
                <th className="py-2 pr-3 text-right font-medium" scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, idx) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-3 text-white/70">{idx + 1}</td>
                  <td className="py-2 pr-3 text-white">{shortText(r.address, 80)}</td>
                  <td className="py-2 pr-3 text-white/80">{r.segmen || "-"}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] ${statusBadgeClass(r.status)}`}
                      aria-label={`status ${r.status || "PENDING"}`}
                    >
                      {r.status || "PENDING"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-white/70">{fmtTime(r.time)}</td>
                  <td className="py-2 pr-3 text-right">
                    <Button 
                      label= {deletingId === r.id ? "Deleting..." : "Delete"}
                      leftIcon={<FaTrash className="text-[10px]" />}                   
                      variant="danger"  
                      size="xs" 
                      radius="md"  
                      onClick={() => onAskDelete(r)}
                      disabled={deletingId === r.id}
                      aria-busy={deletingId === r.id}
                    >                        
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
