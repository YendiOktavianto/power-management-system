"use client";
export default function ProductsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section id="products" className="py-20 px-6 md:px-12 max-w-6xl mx-auto lg:px-25">
      {children}
    </section>
  );
}
