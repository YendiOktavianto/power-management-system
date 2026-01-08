"use client";
import LocationInfo from "./LocationInfo";
import LocationMap from "./LocationMap";

type Props = {
  hqTitle: string;
  address: string;
  hours: string;
  phone: string;
  mapsUrl: string;
  iframeSrc: string;
};

export default function LocationContentGrid({
  hqTitle, address, hours, phone, mapsUrl, iframeSrc,
}: Props) {
  return (
    <div className="py-10 grid md:grid-cols-2 gap-12 items-start bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 rounded-2xl p-8 shadow-lg shadow-blue-900/40 border border-[#1d9bf0]/20">
      <LocationInfo hqTitle={hqTitle} address={address} hours={hours} phone={phone} mapsUrl={mapsUrl} />
      <LocationMap iframeSrc={iframeSrc} />
    </div>
  );
}
