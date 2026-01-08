"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import SectionShell from "../../../../components/features/landing/SectionShell";
import SectionHeading from "../../../../components/features/landing/SectionHeading";
import SectionCard from "../../../../components/features/landing/SectionCard";
import { bodyMuted, accent, body } from "@/components/ui/theme";


type Testimonial = {
  avatar?: string;
  name: string;
  role?: string;
  feedback: string;
};

type Props = { title: string; items: Testimonial[] };

export default function TestimonialsSection({ title, items }: Props) {
  return (
    <SectionShell
      id="testimonials"
      withBg
      altBg
      className="w-full"
      // pakai max width default 6xl
    >
      <SectionHeading className="text-white">
        {title}
      </SectionHeading>

      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".custom-pagination" }}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 25 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        className="pb-12"
      >
        {items.map((item, index) => (
          <SwiperSlide key={index} className="h-full">
            <SectionCard className="h-full min-h-[280px] justify-between items-center">
              {item.avatar && (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-16 h-16 rounded-full border-2 border-[#1d9bf0] mb-4 object-cover object-center"
                />
              )}
              <p
                className={`text-sm sm:text-base text-center italic flex-grow ${body}`}
              >
                &quot;{item.feedback}&quot;
              </p>
              <div className="mt-4 text-center">
                <h4
                  className={`font-semibold text-sm sm:text-base ${accent}`}
                >
                  {item.name}
                </h4>
                {item.role && (
                  <p
                    className={`text-xs sm:text-sm ${bodyMuted}`}
                  >
                    {item.role}
                  </p>
                )}
              </div>
            </SectionCard>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="custom-pagination flex justify-center mt-4" />
    </SectionShell>
  );
}
