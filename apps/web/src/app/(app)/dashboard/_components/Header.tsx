"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* ⬇️ Tambah import komponen */
import Breadcrumbs from "./header/Breadcrumbs";
import ClockPill from "./header/ClockPill";
import ProfileAvatar from "./header/ProfileAvatar";

const POWER_SUBS = new Set(["Voltage","Current","Frequency","Power Factor","Power","Energy Usage"]);
const REPORT_SUBS = new Set(["Summary Report","Energy Usage Report"]);

export default function Header({ time, selectedPage }: any) {
  const pathname = usePathname() || "";

  // Build crumbs (tetap sama)
  const crumbs: string[] = ["Pages"];
  if (pathname.startsWith("/dashboard/power-monitoring")) {
    crumbs.push("Power Monitoring");
    if (POWER_SUBS.has(selectedPage)) crumbs.push(selectedPage);
  } else if (pathname.startsWith("/dashboard/report")) {
    crumbs.push("Report");
    if (REPORT_SUBS.has(selectedPage)) crumbs.push(selectedPage);
  } else if (selectedPage) {
    crumbs.push(selectedPage);
  }

  return (
    <div className="flex justify-between items-center mb-6 mr-8">
      {/* Breadcrumb ⬇️ diganti */}
      <Breadcrumbs crumbs={crumbs} />

      {/* Right (Clock + Profile) ⬇️ diganti */}
      <div className="flex items-center">
        <ClockPill time={time} />
        <ProfileAvatar />
      </div>
    </div>
  );
}
