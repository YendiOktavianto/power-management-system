"use client";

import Navbar from "../../../components/common/layout/Navbar";
import Footer from "../../../components/common/layout/footer";
import LoadingOverlay from "../../../components/common/LoadingOverlay";
import useDiscover from "./useDiscover";

/* ===== Sections ===== */
import Hero from "./_components/Hero";
import FeaturesSection from "./_components/FeaturesSection";
import WorkflowSection from "./_components/WorkflowSection";
import BenefitsSection from "./_components/BenefitsSection";
import ComparisonsSection from "./_components/ComparisonsSection";
import TestimonialsSection from "./_components/TestimonialsSection";

export default function ProductPage() {
  const { isLoading, c, heroBg } = useDiscover();

  if (isLoading) {
    return <LoadingOverlay show={true} text="Loading..." />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#041023] via-[#06305a] to-[#021026] text-white">
      <Navbar />

      <Hero
        heading={c.hero.heading}
        subheading={c.hero.subheading}
        primary={{
            href: c.hero.primaryCta?.href || "/register",
            label: c.hero.primaryCta?.label || "Get Started",
        }}
      />

      <FeaturesSection title={c.titles.features} items={c.features} />
      <WorkflowSection title={c.titles.howItWorks} steps={c.steps} />
      <BenefitsSection title={c.titles.benefits} items={c.benefits} />
      <ComparisonsSection title={c.titles.comparisons} items={c.comparisons} />
      <TestimonialsSection title={c.titles.testimonials} items={c.testimonials} />

      <Footer />
    </main>
  );
}
