"use client";
import React from "react";

export default function Breadcrumbs({ crumbs }: { crumbs: string[] }) {
  return (
    <div className="text-[10px] font-normal text-gray-300">
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && " / "}
          <span className={i === crumbs.length - 1 ? "text-white" : ""}>{c}</span>
        </span>
      ))}
    </div>
  );
}
