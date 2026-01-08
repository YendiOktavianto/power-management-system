"use client";

export default function LocationMap({ iframeSrc }: { iframeSrc: string }) {
  return (
    <div className="relative">
      <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#1d9bf0]/30 shadow-xl shadow-[#1d9bf0]/20">
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
