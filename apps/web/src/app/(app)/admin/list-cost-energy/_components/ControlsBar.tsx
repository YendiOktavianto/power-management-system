"use client";

import { FaSearch } from "react-icons/fa";
import { openPicker } from "../validation";

export default function ControlsBar({
  show,
  setShow,
  search,
  setSearch,
  filterDate,
  setFilterDate,
  timeFrom,
  setTimeFrom,
  timeTo,
  setTimeTo,
}: {
  show: number;
  setShow: (n: number) => void;
  search: string;
  setSearch: (v: string) => void;
  filterDate: string;
  setFilterDate: (v: string) => void;
  timeFrom: string;
  setTimeFrom: (v: string) => void;
  timeTo: string;
  setTimeTo: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 text-white text-xs">
      {/* Show */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Show</label>
        <select
          className="bg-[#123060] p-2 rounded-lg w-13 text-xs"
          value={show}
          onChange={(e) => setShow(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={-1}>All</option>
        </select>
      </div>

      {/* Wattage/Phase search */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Wattage/Phase</label>
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
          <input
            type="text"
            placeholder="Search Wattage/Phase"
            className="p-2 pl-8 rounded-lg bg-[#123060] text-white w-full text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Date</label>
        <input
          type="date"
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          onFocus={(e) => openPicker(e.currentTarget)}
          onClick={(e) => openPicker(e.currentTarget)}
        />
      </div>

      {/* Time From */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Time From</label>
        <input
          type="time"
          step={1}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
          value={timeFrom}
          onChange={(e) => setTimeFrom(e.target.value)}
          onFocus={(e) => openPicker(e.currentTarget)}
          onClick={(e) => openPicker(e.currentTarget)}
        />
      </div>

      {/* Time To */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Time To</label>
        <input
          type="time"
          step={1}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
          value={timeTo}
          onChange={(e) => setTimeTo(e.target.value)}
          onFocus={(e) => openPicker(e.currentTarget)}
          onClick={(e) => openPicker(e.currentTarget)}
        />
      </div>
    </div>
  );
}
