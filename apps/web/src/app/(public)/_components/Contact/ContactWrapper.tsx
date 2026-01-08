"use client";

export default function ContactWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {children}
    </section>
  );
}
