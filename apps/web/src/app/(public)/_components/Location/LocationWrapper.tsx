"use client";

export default function LocationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section id="location" className=" px-6 md:px-12 max-w-7xl mx-auto">
      <div className="p-10">{children}</div>
    </section>
  );
}
