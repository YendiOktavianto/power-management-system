// type.ts
export type WhyItem = { title: string; desc: string };
export type LoPItem = { title: string; icon: string };

export type AboutContent = {
  hero: { title: string; subtitle: string; heroImg: string };
  history: { title: string; body: string };
  vision: { title: string; body: string };
  mission: { title: string; body: string };
  why: WhyItem[];
  lineOfProducts: LoPItem[];
};
