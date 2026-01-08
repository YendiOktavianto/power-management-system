/* ---------------- Types ---------------- */
export type FeatureIconKey = "FaBolt" | "FaChartBar" | "FaLock";

export type Content = {
  hero: {
    heading: string;
    subheading: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    brand: string;
    body: string;
    stats: { value: string; text: string }[];
    companyCta: { label: string; href: string };
  };
  featuresIntro: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  features: { iconKey: FeatureIconKey; title: string; desc: string }[];
  products: {
    title: string;
    tiles: { value: string; text: string }[];
    stable: { title: string; body: string; imageSrc: string };
  };
  leadershipSection: { title: string };
  leadership: { name: string; role: string; img: string }[];
  contactsSection: { title: string; subtitle: string };
  contacts: { name: string; number: string; role: string; img: string }[];
  locationSection: { title: string; subtitle: string; hqTitle: string };
  location: {
    address: string;
    hours: string;
    phone: string;
    mapsUrl: string;
    iframeSrc: string;
  };
};
