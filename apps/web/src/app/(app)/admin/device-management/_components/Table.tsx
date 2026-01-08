"use client";

import Button from "@/components/ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { DeviceRow } from "../types";
import { INFO_CARD_BG } from "@/components/ui/theme";

type Props = {
  data: DeviceRow[];
  loading: boolean;
  onEdit: (row: DeviceRow) => void;
  onDelete: (row: DeviceRow) => void;
};

export default function Tabel({ data, loading, onEdit, onDelete }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-[10px]">
        <thead className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md" style={{ background: INFO_CARD_BG }}>                
        <tr>
            {[
              "Serial Number",
              "Owner",
              "Wattage/Phase",
              "Location",
              "Lat",
              "Long",
              "Segment",
              "Active",
              "Action",
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-6">
                {loading ? "Loading..." : "No data found"}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={String(row.id)}
                className={index % 2 === 0 ? "" : "bg-[#1C345C]/80"}
                style={index % 2 === 0 ? { background: INFO_CARD_BG } : undefined}
              >
                <td className="px-2 py-2">{row.serial_number}</td>
                <td className="px-2 py-2">{row.username}</td>
                <td className="px-2 py-2">
                  {row.wattage} / {row.phase}
                </td>
                <td className="px-2 py-2">
                  {row.address_name} | {row.detail_address_name}
                </td>
                <td className="px-2 py-2">{row.lat}</td>
                <td className="px-2 py-2">{row.long}</td>
                <td className="px-2 py-2">{row.segment}</td>
                <td className="px-2 py-2">{row.active}</td>
                <td className="flex gap-2 py-2 px-5">
                  <Button
                    variant="info"
                    size="xs"
                    radius="md"
                    onClick={() => onEdit(row)}
                  >
                    <FaEdit size={12} />
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    radius="md"
                    onClick={() => onDelete(row)}
                  >
                    <FaTrash size={12} />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
