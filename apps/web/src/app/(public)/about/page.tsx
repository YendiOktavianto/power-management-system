"use client";

import Navbar from "../../../components/common/layout/Navbar";
import Footer from "../../../components/common/layout/footer";
import LoadingOverlay from "../../../components/common/LoadingOverlay";

import useAbout from "./useAbout";
import { FALLBACK } from "./constants";

import AboutHero from "./_components/AboutHero";
import AboutHistory from "./_components/AboutHistory";
import AboutVisionMission from "./_components/AboutVisionMission";
import AboutWhy from "./_components/AboutWhy";
import AboutProducts from "./_components/AboutProducts";

import LandingMain from "@/components/features/landing/LandingMain";

export default function AboutPage() {
  const { isLoading, c } = useAbout();

  if (isLoading || !c) {
    return <LoadingOverlay show={true} text="Loading..." />;
  }

  const hero = {
    title: c.hero.title || FALLBACK.hero.title,
    subtitle: c.hero.subtitle || FALLBACK.hero.subtitle,
    heroImg: c.hero.heroImg || FALLBACK.hero.heroImg,
  };

  const history = {
    title: c.history.title || FALLBACK.history.title,
    body: c.history.body || FALLBACK.history.body,
  };

  const vision = c.vision || FALLBACK.vision;
  const mission = c.mission || FALLBACK.mission;

  const whyItems = c.why?.length ? c.why : FALLBACK.why;
  const productsItems = c.lineOfProducts?.length
    ? c.lineOfProducts
    : FALLBACK.lineOfProducts;

  return (
    <LandingMain>
      <Navbar />

      <AboutHero
        title={hero.title}
        subtitle={hero.subtitle}
        heroImg={hero.heroImg}
      />

      <AboutHistory title={history.title} body={history.body} />

      <AboutVisionMission vision={vision} mission={mission} />

      <AboutWhy
        heading="Why Choose PT Innotech Global Solusindo?"
        items={whyItems}
      />

      <AboutProducts
        heading="Line of Products & Services"
        items={productsItems}
      />

      <Footer />
    </LandingMain>
  );
}
