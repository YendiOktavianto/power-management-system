"use client";

type LocationOption = { id: string; name: string };

type ControlsProps = {
  show: number;
  setShow: (v: number) => void;

  selectedLocation: string;
  setSelectedLocation: (v: string) => void;

  filterDate: string;
  setFilterDate: (v: string) => void;

  timeFrom: string;
  setTimeFrom: (v: string) => void;

  timeTo: string;
  setTimeTo: (v: string) => void;

  locations: LocationOption[];

  openPicker: (el: HTMLInputElement | null) => void;
};

export default function Controls({
  show,
  setShow,
  selectedLocation,
  setSelectedLocation,
  filterDate,
  setFilterDate,
  timeFrom,
  setTimeFrom,
  timeTo,
  setTimeTo,
  locations,
  openPicker,
}: ControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 text-white text-xs">
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

      {/* Location */}
      <div className="flex flex-col col-span-2">
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

      {/* Date */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Date</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          onFocus={(e) => openPicker(e.currentTarget)}
          onClick={(e) => openPicker(e.currentTarget)}
          className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full [&::-webkit-calendar-picker-indicator]:invert"
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
