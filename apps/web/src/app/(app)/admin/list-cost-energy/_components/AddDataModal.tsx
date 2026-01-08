"use client";

import type { Row } from "./Table";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";

export default function AddDataModal({
  open,
  onClose,
  filteredData,
  newPower,
  setNewPower,
  newCost,
  setNewCost,
  newValidFrom,
  setNewValidFrom,
  onSubmit,
  newValidUntil,
  setNewValidUntil,
  formErrors = {},
  apiError,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  filteredData: Row[];
  newPower: string;
  setNewPower: (v: string) => void;
  newCost: string | number;
  setNewCost: (v: string) => void;
  newValidFrom: string;
  setNewValidFrom: (v: string) => void;
  newValidUntil: string;
  setNewValidUntil: (v: string) => void;
  formErrors?: Record<string, string | undefined>;
  apiError?: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div className="space-y-3 text-sm">
        <h2
          id="add-data-title"
          className="text-lg font-bold mb-4 text-center"
        >
          Add New Data
        </h2>

        {apiError && (
          <p className="text-red-300 text-xs mb-2">
            {apiError}
          </p>
        )}

        <form className="flex flex-col gap-3 text-sm" onSubmit={onSubmit}>
          {/* Wattage / Phase */}
          <div>
            <label className="block text-[10px] text-white mb-1">
              Wattage/Phase
            </label>

            <div className="relative">
              <select
                className="
                  w-full pr-9 px-3 py-2 appearance-none
                  rounded-xl bg-white/5 border border-white/10 text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  active:bg-white/10
                "
                value={newPower}
                onChange={(e) => setNewPower(e.target.value)}
                required
              >
                <option value="" className="bg-[#103879] text-white">
                  -- Select Wattage/Phase --
                </option>
                {[...new Set(filteredData.map((row) => `${row.power} / ${row.phase}`))].map(
                  (wp) => (
                    <option
                      key={wp}
                      value={wp}
                      className="bg-[#103879] text-white"
                    >
                      {wp}
                    </option>
                  )
                )}
              </select>

              {/* Arrow custom */}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
            {formErrors.power && (
            <p className="text-xs text-red-400 mt-1">
              {formErrors.power}
            </p>
            )}
          </div>

          {/* Cost (pakai FormInput variant card) */}
          <FormInput
            label="Cost (Rupiah)"
            type="number"
            name="cost"
            size="md"
            variant="dashboard"
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
            placeholder="Cost (Rupiah)"
            error={formErrors.cost}
          />

          <FormInput
            label="Date from"
            type="datetime-local"
            name="valid_from"
            size="md"
            variant="dashboard"
            value={newValidFrom}
            onChange={(e) => setNewValidFrom(e.target.value)}
            inputClassName="date-input-dark"
            // tampilkan error validasi lokal atau pesan BE di bawah input
            error={formErrors.validFrom || apiError}
          />

          <div className="flex justify-end gap-2 mt-6 ml-50">
            <Button
              type="button"
              label="Cancel"
              variant="secondary"
              onClick={onClose}
              size="sm"
              radius="xl"
              disabled={submitting}
            > 
            </Button>
            <Button
              type="submit"
              label={submitting ? "Saving..." : "Save"}
              variant="primary"
              size="sm"
              radius="xl"
              disabled={submitting}
            >              
            </Button>
          </div>
        </form>

    </div>
  );
}
