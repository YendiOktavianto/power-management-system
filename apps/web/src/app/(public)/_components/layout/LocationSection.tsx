"use client";
import { MapPin, Clock, Phone } from "lucide-react";
import { FALLBACK } from "../../constants";
import type { Content } from "../../types";

export default function LocationSection({ content }: { content: Content }) {
  return (
    <section id="location" className=" px-6 md:px-12 max-w-7xl mx-auto">
      <div className="p-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#e6f5ff] tracking-tight">
            {content.locationSection.title || FALLBACK.locationSection.title}
          </h2>
          <p className="mt-4 text-[#cfe9ff] max-w-xl mx-auto text-base">
            {content.locationSection.subtitle || FALLBACK.locationSection.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="py-10 grid md:grid-cols-2 gap-12 items-start bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 rounded-2xl p-8 shadow-lg shadow-blue-900/40 border border-[#1d9bf0]/20">
          {/* Info Section */}
          <div className="rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[#7ec7ff] mb-6">
              {content.locationSection.hqTitle || FALLBACK.locationSection.hqTitle}
            </h3>
            <ul className="space-y-5 text-[#cfe9ff] text-sm md:text-base leading-relaxed">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                {content.location.address}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                {content.location.hours}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                {content.location.phone}
              </li>
            </ul>

            <a
              href={content.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1d9bf0] to-[#1277c9] hover:opacity-90 text-white text-sm font-medium shadow-md shadow-[#1d9bf0]/30 transition"
            >
              Open Google Maps
            </a>
          </div>

          {/* Map Section */}
          <div className="relative">
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#1d9bf0]/30 shadow-xl shadow-[#1d9bf0]/20">
              <iframe
                src={content.location.iframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

