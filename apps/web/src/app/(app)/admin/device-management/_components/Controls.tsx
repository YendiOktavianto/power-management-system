"use client";

import { FaSearch } from "react-icons/fa";

type Props = {
  show: number;
  onChangeShow: (value: number) => void;
  search: string;
  onChangeSearch: (value: string) => void;
};

export default function Controls({
  show,
  onChangeShow,
  search,
  onChangeSearch,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mb-4 text-white text-xs">
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Show</label>
        <select
          className="bg-[#123060] p-2 rounded-lg w-13 text-xs"
          value={show}
          onChange={(e) => onChangeShow(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={-1}>All</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Search</label>
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
          <input
            type="text"
            placeholder="Search"
            className="p-2 pl-8 rounded-lg bg-[#123060] text-white w-full text-xs"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
