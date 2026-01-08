"use client";

import * as theme from "@/components/ui/theme";
import Navbar from "../../components/common/layout/Navbar";
import Footer from "../../components/common/layout/footer";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import useLandingPage from "./useLandingPage";
import { FALLBACK } from "./constants";
import HeroShapes from "./_components/Hero/HeroShapes";
import HeroHeading from "./_components/Hero/HeroHeading";
import HeroSubheading from "./_components/Hero/HeroSubheading";
import HeroCtas from "./_components/Hero/HeroCtas";
import HeroWrapper from "./_components/Hero/HeroWrapper";
import AboutHeading from "./_components/About/AboutHeading";
import AboutBody from "./_components/About/AboutBody";
import AboutStatsGrid from "./_components/About/AboutStatsGrid";
import CompanyCta from "./_components/About/CompanyCta";
import AboutWrapper from "./_components/About/AboutWrapper";
import FeaturesWrapper from "./_components/Features/FeaturesWrapper";
import FeaturesIntro from "./_components/Features/FeaturesIntro";
import FeaturesGrid from "./_components/Features/FeaturesGrid";
import ProductsWrapper from "./_components/Product/ProductsWrapper";
import ProductsHeading from "./_components/Product/ProductsHeading";
import ProductsTilesGrid from "./_components/Product/ProductsTilesGrid";
import ProductsStableBox from "./_components/Product/ProductsStableBox";
import LeadershipWrapper from "./_components/Leadership/LeadershipWrapper";
import LeadershipHeading from "./_components/Leadership/LeadershipHeading";
import LeadershipGrid from "./_components/Leadership/LeadershipGrid";
import ContactWrapper from "./_components/Contact/ContactWrapper";
import ContactHeading from "./_components/Contact/ContactHeading";
import ContactGrid from "./_components/Contact/ContactGrid";
import LocationWrapper from "./_components/Location/LocationWrapper";
import LocationHeading from "./_components/Location/LocationHeading";
import LocationContentGrid from "./_components/Location/LocationContentGrid";

import LandingMain from "@/components/features/landing/LandingMain";

export default function LandingPage() {
  const { bootLoading, content } = useLandingPage();

  if (bootLoading || !content) {
    return <LoadingOverlay show={true} text="Loading..." />;
  }

  const headingNode =
    content.hero.heading || (
      <>
        Intelligent{" "}
        <span className={theme.heading}>
          Energy Management
        </span>{" "}
        for a Smarter, Sustainable Future
      </>
    );

  const intro = content.featuresIntro ?? FALLBACK.featuresIntro;
  const features = content.features ?? [];

  const title = content.products.title || FALLBACK.products.title;
  const tiles = content.products.tiles ?? FALLBACK.products.tiles;
  const stable = {
    title: content.products.stable.title || FALLBACK.products.stable.title,
    body: content.products.stable.body || FALLBACK.products.stable.body,
    imageSrc: content.products.stable.imageSrc || "/monitoring.png",
  };

  const teamTitle =
    content.leadershipSection.title || FALLBACK.leadershipSection.title;
  const members = content.leadership ?? [];

  const contactTitle =
    content.contactsSection.title || FALLBACK.contactsSection.title;
  const subtitle =
    content.contactsSection.subtitle || FALLBACK.contactsSection.subtitle;
  const people = content.contacts ?? [];

  const locTitle =
    content.locationSection.title || FALLBACK.locationSection.title;
  const locSubtitle =
    content.locationSection.subtitle || FALLBACK.locationSection.subtitle;
  const hqTitle =
    content.locationSection.hqTitle || FALLBACK.locationSection.hqTitle;

  return (
    <LandingMain>
      <Navbar />

      <HeroWrapper>
        <HeroShapes />
        <HeroHeading>{headingNode}</HeroHeading>
        <HeroSubheading>
          {content.hero.subheading || FALLBACK.hero.subheading}
        </HeroSubheading>
        <HeroCtas
          primary={{
            href: content.hero.primaryCta?.href || "/register",
            label: content.hero.primaryCta?.label || "Experience It Now",
          }}
          secondary={{
            href: content.hero.secondaryCta?.href || "/discover",
            label:
              content.hero.secondaryCta?.label ||
              "Discover More Features",
          }}
        />
      </HeroWrapper>

      <AboutWrapper>
        <AboutHeading brand={content.about.brand || "PowerSys"} />
        <AboutBody body={content.about.body || FALLBACK.about.body} />
        <AboutStatsGrid stats={content.about.stats} />
        <CompanyCta
          secondary={{
            href: content.about.companyCta?.href || "/about",
            label:
              content.about.companyCta?.label ||
              "Learn More About Our Company",
          }}
        />
      </AboutWrapper>

      <FeaturesWrapper>
        <FeaturesIntro
          eyebrow={intro.eyebrow}
          headline={intro.headline}
          body={intro.body}
        />
        <FeaturesGrid features={features} />
      </FeaturesWrapper>

      <ProductsWrapper>
        <ProductsHeading title={title} />
        <div className="space-y-10">
          <ProductsTilesGrid tiles={tiles} />
          <ProductsStableBox {...stable} />
        </div>
      </ProductsWrapper>

      <LeadershipWrapper>
        <LeadershipHeading title={teamTitle} />
        <LeadershipGrid members={members} />
      </LeadershipWrapper>

      <ContactWrapper>
        <ContactHeading title={contactTitle} subtitle={subtitle} />
        <ContactGrid people={people} />
      </ContactWrapper>

      <LocationWrapper>
        <LocationHeading title={locTitle} subtitle={locSubtitle} />
        <LocationContentGrid
          hqTitle={hqTitle}
          address={content.location.address}
          hours={content.location.hours}
          phone={content.location.phone}
          mapsUrl={content.location.mapsUrl}
          iframeSrc={content.location.iframeSrc}
        />
      </LocationWrapper>

      <Footer />
    </LandingMain>
  );
}
