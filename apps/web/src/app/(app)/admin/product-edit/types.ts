export type ToastKind = "success" | "error" | "info";
export type ToastData = { open: boolean; kind: ToastKind; title: string; desc?: string };

export type Feature = { title: string; desc: string; img: string };
export type Step = { title: string; desc: string };
export type Benefit = { title: string; desc: string };
export type Comparison = { title: string; desc: string };
export type Testimonial = { name: string; role: string; feedback: string; avatar: string };

export type ProductContent = {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    heroImg: string; // background hero
  };
  features: Feature[];
  steps: Step[];
  benefits: Benefit[];
  comparisons: Comparison[];
  testimonials: Testimonial[];
};


export type HeaderBarProps = {
  title: string;
  saving: boolean;
  onPreview: () => void;
  onUseTemplate: () => void;
  onReset: () => void;
  onSave: () => void;
};
