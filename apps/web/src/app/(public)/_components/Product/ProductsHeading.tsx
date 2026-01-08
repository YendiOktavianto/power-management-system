"use client";
export default function ProductsHeading({ title }: { title: string }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold text-center text-[#e6f5ff] mb-16">
      {title}
    </h2>
  );
}
