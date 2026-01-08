// apps/web/src/app/(reports)/energy-usage/_components/Controls.tsx
"use client";

import type { Props } from "../types";

export default function Controls({
  show,
  setShow,
  selectedLocation,
  setSelectedLocation,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  locations,
  openPicker,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-white text-xs">
      {/* Show */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Show</label>
        <select
          value={show}
          onChange={(e) => setShow(Number(e.target.value))}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-13"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={-1}>All</option>
        </select>
      </div>

      {/* Location */}
      <div className="flex flex-col col-span-1">
        <label className="mb-1 font-semibold">Location</label>
        <select
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date From */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Date From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onClick={(e) => openPicker(e.currentTarget)}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Date To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onClick={(e) => openPicker(e.currentTarget)}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
        />
      </div>
    </div>
  );
}
