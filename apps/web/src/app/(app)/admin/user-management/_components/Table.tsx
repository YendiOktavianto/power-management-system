"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import { INFO_CARD_BG } from "@/components/ui/theme";
import Button from "@/components/ui/Button"

export default function UsersTable({
  rows,
  onEdit,
  onAskDelete,
}: {
  rows: Array<{
    id: string | number;
    username: string;
    email: string;
    phone_number: string;
    role: string;
    total_device: number | string;
    created_at: string;
  }>;
  onEdit: (row: any) => void;
  onAskDelete: (row: any) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
      <table className="min-w-full text-white text-xs">
        <thead
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md"
          style={{ background: INFO_CARD_BG }}
        >          
        <tr>
            {["Username","Email","Number Phone","Role","Total Devices","Created At","Actions"].map((h) => (
              <th key={h} className="px-4 py-4 text-left font-semibold uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-6">No data found</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={String(row.id)}
                className={index % 2 === 0 ? "" : "bg-[#1C345C]/80"}
                style={index % 2 === 0 ? { background: INFO_CARD_BG } : undefined}
              >
                <td className="px-2 py-2">{row.username}</td>
                <td className="px-2 py-2">{row.email}</td>
                <td className="px-2 py-2">{row.phone_number}</td>
                <td className="px-2 py-2">{row.role}</td>
                <td className="px-2 py-2">{row.total_device}</td>
                <td className="px-2 py-2">{row.created_at}</td>
                <td className="flex gap-2 py-2 px-5">
                  <Button
                    type="button"
                    size="xs"
                    radius="md"
                    variant="info"
                    onClick={() => onEdit(row)}
                  >
                    <FaEdit size={12} />
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    radius="md"
                    variant="danger"
                    onClick={() => onAskDelete(row)}
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
