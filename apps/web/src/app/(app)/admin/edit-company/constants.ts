// constants.ts
import type { AboutContent } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/+$/, "") || "http://localhost:4000";
export const ABOUT_KEY = process.env.NEXT_PUBLIC_ABOUT_KEY ?? "company";
export const UPLOAD_PATH = process.env.NEXT_PUBLIC_UPLOAD_PATH || "/api/v1/upload";
export const DEFAULTS: AboutContent = {
  hero: { title: "", subtitle: "", heroImg: "" },
  history: { title: "", body: "" },
  vision: { title: "", body: "" },
  mission: { title: "", body: "" },
  why: [],
  lineOfProducts: [],
};

export const TEMPLATE_ABOUT: AboutContent = {
  hero: {
    title: "About PT Innotech Global Solusindo",
    subtitle:
      "Driving innovative electrical solutions for a smarter and sustainable energy future.",
    heroImg: "/company.png",
  },
  history: {
    title: "Brief History",
    body:
      "The rapid development of technology across sectors has led to an ever-growing demand for electricity—both in quantity and quality. Inspired to take an active role in delivering sustainable and reliable electrical solutions, PT Innotech Global Solusindo (PT IGS) was established as a local Indonesian company providing products and solutions for the power industry.\n\nThis represents not only a great opportunity but also a challenge that motivates us to consistently deliver high-quality electrical products, integrated solutions, and awareness of the importance of reliable electricity for society worldwide.",
  },
  vision: {
    title: "Vision",
    body: "To be the pioneer of innovative electrical solutions worldwide.",
  },
  mission: {
    title: "Mission",
    body:
      "To provide innovative, valuable, and reliable electrical solutions, tailored to the specific needs of industries and communities.",
  },
  why: [
    {
      title: "Innovation & Quality",
      desc:
        "All products and services are designed to meet the highest standards of reliability and efficiency.",
    },
    {
      title: "Professional Technical Support",
      desc:
        "Our certified engineers provide full assistance from pre-implementation to after-sales support.",
    },
    {
      title: "Integrated Solutions",
      desc:
        "We deliver customizable solutions aligned with your budget and specific business requirements.",
    },
  ],
  lineOfProducts: [
    { title: "Electric Power Quality Improver", icon: "⚡" },
    { title: "Electric Power Management System", icon: "🖥️" },
    { title: "Sheet Metal Fabrication", icon: "🏭" },
  ],
};

