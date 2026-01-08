// constants.ts
import type { ProductContent } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/+$/, "") || "http://localhost:4000";
export const PRODUCT_KEY = process.env.NEXT_PUBLIC_PRODUCT_KEY ?? "product";
export const UPLOAD_PATH = process.env.NEXT_PUBLIC_UPLOAD_PATH || "/api/v1/upload";

export function joinUrl(base: string, path: string) {
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/* ---------------- Defaults & Template ---------------- */
export const DEFAULTS: ProductContent = {
  hero: { title: "", subtitle: "", ctaLabel: "", heroImg: "" },
  features: [],
  steps: [],
  benefits: [],
  comparisons: [],
  testimonials: [],
};

// Template awal yang match ProductPage
export const TEMPLATE_PRODUCT: ProductContent = {
  hero: {
    title: "Smart Lamp Monitoring Kit",
    subtitle:
      "Integrated hardware and software solution for real-time lamp monitoring, control, and energy optimization.",
    ctaLabel: "Get Started",
    heroImg: "/product-hero.jpg",
  },
  features: [
    {
      title: "Hardware Kit",
      desc: "Includes smart sensors for your lamps. Visualize connections with our setup diagram for easy installation.",
      img: "/monitoring.png",
    },
    {
      title: "Web App",
      desc: "Control and monitor lamps remotely. Dashboard includes real-time status, energy consumption charts, and interactive controls.",
      img: "/monitoring.png",
    },
    {
      title: "Analytics & Reports",
      desc: "Track energy usage, monitor efficiency, generate actionable insights. Charts, bar graphs, and PDF export included.",
      img: "/monitoring.png",
    },
  ],
  steps: [
    {
      title: "Install Devices",
      desc: "Mount controllers and sensors to lamps following our guide. Connect each device securely to the network.",
    },
    {
      title: "Connect to App",
      desc: "Link devices via Wi-Fi or IoT gateway. Ensure each lamp is registered and visible on the dashboard.",
    },
    {
      title: "Monitor & Optimize",
      desc: "Access real-time data, receive alerts, and automate schedules. Analyze energy consumption for cost savings.",
    },
  ],
  benefits: [
    { title: "Reduce Energy Costs", desc: "Save up to 30% on electricity by automating schedules and monitoring usage." },
    { title: "Save Time & Maintenance", desc: "Automated alerts reduce manual inspection and ensure timely maintenance." },
    { title: "Data-Driven Decisions", desc: "Analytics provide actionable insights to optimize operations and performance." },
    { title: "Secure & Reliable", desc: "Encrypted data and secure cloud connection ensures safety of all information." },
  ],
  comparisons: [
    { title: "Stability & Reliability", desc: "System uptime is 99.9% with minimal maintenance." },
    { title: "Scalability", desc: "Easily expand to multiple locations or lamp groups without performance drop." },
    { title: "Integration", desc: "Compatible with other IoT systems and third-party apps." },
    { title: "Performance", desc: "Real-time response under 2 seconds and optimized resource usage." },
  ],
  testimonials: [
    {
      name: "Alice Johnson",
      role: "Facility Manager, GreenTech Co.",
      feedback:
        "Monitoring multiple lamps has never been easier. The integrated system is seamless!",
      avatar: "/profile.svg",
    },
    {
      name: "Mark Davis",
      role: "Operations Lead, BrightEnergy",
      feedback:
        "Installation was simple and the dashboard is extremely intuitive. Energy savings are noticeable!",
      avatar: "/profile.svg",
    },
    {
      name: "Sophia Lee",
      role: "Energy Analyst, EcoSmart",
      feedback: "I love the analytics feature. It helps me track energy usage efficiently.",
      avatar: "/profile.svg",
    },
    {
      name: "John Smith",
      role: "Maintenance Supervisor, UrbanLights",
      feedback: "The remote control works perfectly. I can manage lamps from anywhere.",
      avatar: "/profile.svg",
    },
  ],
};
