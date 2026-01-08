"use client";

type Props = { children: React.ReactNode };

export default function FeaturesWrapper({ children }: Props) {
  return (
    <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 p-10 md:p-16">
        {children}
      </div>
    </section>
  );
}
