import React from "react";
import { FaBolt, FaChartBar, FaLock } from "react-icons/fa";
import type { Content, FeatureIconKey } from "./types";

/* ------------- Icon map ------------- */
export const ICON_MAP: Record<FeatureIconKey, React.ReactElement> = {
  FaBolt: React.createElement(FaBolt, { size: 48 }),
  FaChartBar: React.createElement(FaChartBar, { size: 48 }),
  FaLock: React.createElement(FaLock, { size: 48 }),
};
/* ------------- Fallback (kalau JSON belum ada) ------------- */
export const FALLBACK: Content = {
  hero: {
    heading: "Intelligent Energy Management for a Smarter, Sustainable Future",
    subheading:
      "Power management system offers a cutting-edge platform for real-time energy monitoring and management, helping you optimize consumption, reduce costs, and promote sustainability—all through a secure and intuitive interface.",
    primaryCta: { label: "Experience It Now", href: "/register" },
    secondaryCta: { label: "Discover More Features", href: "/discover" },
  },
  about: {
    brand: "PowerSys",
    body:
      "Power Monitoring System is an intelligent energy management platform designed to help businesses monitor, analyze, and optimize their power usage in real time. With advanced analytics and secure infrastructure, PowerSys empowers organizations to reduce costs and embrace a sustainable future.",
    stats: [
      { value: "3k+", text: "Businesses already trust Power Monitoring System" },
      { value: "20%", text: "Average energy savings per client" },
      { value: "24/7", text: "Secure monitoring & support" },
    ],
    companyCta: { label: "Learn More About Our Company", href: "/about" },
  },
  featuresIntro: {
    eyebrow: "Future Energy",
    headline: "Experience that grows with your scale.",
    body:
      "Design an energy management system tailored to your needs, featuring real-time monitoring, actionable insights, and secure data handling. Scale effortlessly as your operations grow.",
  },
  features: [
    {
      iconKey: "FaBolt",
      title: "Real-Time Monitoring",
      desc:
        "Monitor your devices instantly and gain full control over your energy usage in real time.",
    },
    {
      iconKey: "FaChartBar",
      title: "Energy Analytics",
      desc:
        "Visualize your energy consumption through detailed, interactive analytics and actionable insights.",
    },
    {
      iconKey: "FaLock",
      title: "Data Security",
      desc:
        "All your data is encrypted and protected with industry-standard security measures for complete peace of mind.",
    },
  ],
  products: {
    title: "Why Choose Power Management System",
    tiles: [
      {
        value: "3k +",
        text: "Businesses already Running on Power Management System",
      },
      {
        value: "",
        text:
          "PowerSys integrates effortlessly with your existing infrastructure, ensuring a smooth transition without disruptions to your daily workflow.",
      },
    ],
    stable: {
      title: "Stable Performance",
      body:
        "No asset volatility – reliable, consistent, and predictable performance. With PowerSys, your operations remain uninterrupted, ensuring smooth performance that scales with your business. Designed for durability and long-term stability, our system provides confidence at every step of your energy journey.",
      imageSrc: "/monitoring.png",
    },
  },
  leadershipSection: { title: "Our Leadership Team" },
  leadership: [
    {
      name: "Alice Khol",
      role:
        "CEO - Leading the company's vision for sustainable energy solutions.",
      img: "/35.svg",
    },
    {
      name: "Robert Brown",
      role:
        "CTO - Overseeing technological innovation and product development.",
      img: "/31.svg",
    },
    {
      name: "Emma Davis",
      role: "COO - Managing operations to ensure efficiency and growth.",
      img: "/11.svg",
    },
  ],
  contactsSection: {
    title: "Contact Our Team",
    subtitle:
      "Reach out directly to the right expert. Quick, simple, and professional.",
  },
  contacts: [
    { name: "David", number: "6281234567890", role: "Sales Manager", img: "/22.svg" },
    { name: "Sophia", number: "6289876543210", role: "Customer Support", img: "/1.svg" },
    { name: "Michael", number: "6281122334455", role: "Technical Support", img: "/3.svg" },
  ],
  locationSection: {
    title: "Our Location",
    subtitle:
      "Visit our head office or reach out through phone. We’re available during business hours.",
    hqTitle: "headquarters office",
  },
  location: {
    address:
      "Jl. Kp Pamahan No 63 Kel. Jatimekar, Kel. Jatiasih Bekasi - Jawa Barat.",
    hours: "Monday – Friday, 09:00 – 17:30",
    phone: "+62 812 3456 7890",
    mapsUrl: "https://maps.app.goo.gl/gvk4YYXyBh6SgBPQA",
    iframeSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.635313053707!2d106.8302673153913!3d-6.208763662548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e7f2e7d2bb%3A0x9f1a6e6d4e02a2e7!2sJakarta!5e0!3m2!1sen!2sid!4v1691234567890!5m2!1sen!2sid",
  },
};
