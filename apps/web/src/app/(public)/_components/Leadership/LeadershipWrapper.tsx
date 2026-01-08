"use client";

export default function LeadershipWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section id="team" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      {children}
    </section>
  );
}
