// apps/web/src/app/(products)/discover/type.ts

export type Features = {
  hero: {
    heading: string;
    subheading: string;
    primaryCta: { label: string; href: string };
  };
  titles: {
    features: string;
    howItWorks: string;
    benefits: string;
    comparisons: string;
    testimonials: string;
  };
  features: { title: string; desc: string; img?: string }[];
  steps: { title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
  comparisons: { title: string; desc: string }[];
  testimonials: {
    name: string;
    role?: string;
    feedback: string;
    avatar?: string;
  }[];
};

/** Bentuk data dari AdminProductEditor (referensi) */
export type ProductContent = {
  hero?: { title?: string; subtitle?: string; ctaLabel?: string; heroImg?: string };
  advantages?: string[];
  features?: { title: string; desc: string; img: string }[];
  steps?: { title: string; desc: string }[];
  benefits?: { title: string; desc: string }[];
  comparisons?: { title: string; desc: string }[];
  testimonials?: { name: string; role: string; feedback: string; avatar: string }[];
};
