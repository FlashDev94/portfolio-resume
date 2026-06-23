import type { PortfolioData } from "./types";
import { DEFAULT_CUSTOM_COLORS } from "./themes";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 11)}`;

export const DEFAULT_PORTFOLIO: PortfolioData = {
  themeId: "midnight",
  customColors: { ...DEFAULT_CUSTOM_COLORS },
  theme: "dark",
  accentColor: "#3B82F6",
  hero: {
    name: "Alex Rivera",
    title: "Full-Stack Engineer & Product Designer",
    tagline:
      "I craft accessible, high-performance web experiences that recruiters remember and users love.",
    location: "San Francisco, CA · Remote-friendly",
    avatarUrl: "",
    ctaPrimary: "View Projects",
    ctaSecondary: "Download Resume",
  },
  about: {
    heading: "About Me",
    body: "I'm a product-minded engineer with 8+ years shipping customer-facing platforms. My focus sits at the intersection of clean architecture, inclusive design, and measurable outcomes. I mentor teams on accessibility (WCAG 2.2 AA), Core Web Vitals, and design systems that scale.\n\nPreviously at growth-stage startups and enterprise SaaS, I led initiatives that improved conversion by double digits while cutting load times in half. I believe great portfolios — and great products — balance craft with clarity.",
    yearsExperience: 8,
    projectsDelivered: 42,
    happyClients: 18,
  },
  skills: [
    { id: uid(), name: "TypeScript", level: 95, category: "Languages" },
    { id: uid(), name: "React / Next.js", level: 92, category: "Frontend" },
    { id: uid(), name: "Node.js", level: 88, category: "Backend" },
    { id: uid(), name: "PostgreSQL", level: 82, category: "Data" },
    { id: uid(), name: "Tailwind CSS", level: 90, category: "Frontend" },
    { id: uid(), name: "Accessibility (WCAG)", level: 85, category: "Quality" },
    { id: uid(), name: "System Design", level: 80, category: "Architecture" },
    { id: uid(), name: "Framer Motion", level: 78, category: "Frontend" },
  ],
  experience: [
    {
      id: uid(),
      company: "Northstar Labs",
      role: "Senior Full-Stack Engineer",
      location: "Remote",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Lead engineer for the customer portal and design system. Partner with design on inclusive UI patterns.",
      highlights: [
        "Cut LCP from 3.8s to 1.4s across core routes",
        "Shipped WCAG 2.2 AA compliance program",
        "Mentored 4 engineers on React performance",
      ],
    },
    {
      id: uid(),
      company: "Orbit Commerce",
      role: "Frontend Engineer",
      location: "New York, NY",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      description:
        "Owned storefront experience for a multi-brand e-commerce platform serving 2M+ monthly visitors.",
      highlights: [
        "Built modular component library adopted by 3 squads",
        "Improved mobile conversion by 14%",
        "Introduced visual regression testing",
      ],
    },
    {
      id: uid(),
      company: "Pixel & Code Studio",
      role: "UI Developer",
      location: "Austin, TX",
      startDate: "2017-01",
      endDate: "2019-05",
      current: false,
      description:
        "Delivered marketing sites and product UIs for startups and agencies.",
      highlights: [
        "Launched 20+ client sites with Lighthouse 90+",
        "Standardized brand tokens and typography scales",
      ],
    },
  ],
  projects: [
    {
      id: uid(),
      title: "Pulse Analytics Dashboard",
      description:
        "Real-time analytics suite with accessible charts, role-based views, and sub-second filters on million-row datasets.",
      tech: ["Next.js", "TypeScript", "D3", "PostgreSQL"],
      imageUrl: "",
      liveUrl: "https://example.com/pulse",
      repoUrl: "https://github.com/example/pulse",
      featured: true,
    },
    {
      id: uid(),
      title: "Aether Design System",
      description:
        "Token-driven component library with WCAG-tested primitives, theming, and documentation site.",
      tech: ["React", "Storybook", "Tailwind", "Radix"],
      imageUrl: "",
      liveUrl: "https://example.com/aether",
      repoUrl: "https://github.com/example/aether",
      featured: true,
    },
    {
      id: uid(),
      title: "HireFlow ATS",
      description:
        "Applicant tracking tool with inclusive forms, keyboard-first flows, and resume parsing.",
      tech: ["Next.js", "Node", "OpenAI", "Prisma"],
      imageUrl: "",
      liveUrl: "https://example.com/hireflow",
      repoUrl: "https://github.com/example/hireflow",
      featured: false,
    },
    {
      id: uid(),
      title: "Lumina Portfolio CMS",
      description:
        "Headless CMS tailored for creative portfolios with 3D project showcases and SEO scoring.",
      tech: ["Vite", "Three.js", "Supabase"],
      imageUrl: "",
      liveUrl: "https://example.com/lumina",
      repoUrl: "https://github.com/example/lumina",
      featured: true,
    },
  ],
  education: [
    {
      id: uid(),
      school: "University of California, Berkeley",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2013",
      endDate: "2017",
      description: "HCI focus · Dean's List · Capstone on inclusive interfaces",
    },
  ],
  contact: {
    heading: "Let's work together",
    subheading:
      "Open to senior IC and staff-level roles, advisory work, and select freelance partnerships.",
    email: "alex.rivera@example.com",
    phone: "+1 (415) 555-0142",
    availability: "Available for opportunities starting Q3 2026",
  },
  socials: [
    { id: uid(), label: "LinkedIn", url: "https://linkedin.com/in/example" },
    { id: uid(), label: "GitHub", url: "https://github.com/example" },
    { id: uid(), label: "Portfolio", url: "https://example.com" },
  ],
  sections: [
    { id: "hero", label: "Hero", enabled: true, order: 0 },
    { id: "about", label: "About", enabled: true, order: 1 },
    { id: "skills", label: "Skills", enabled: true, order: 2 },
    { id: "experience", label: "Experience", enabled: true, order: 3 },
    { id: "projects", label: "Projects", enabled: true, order: 4 },
    { id: "education", label: "Education", enabled: true, order: 5 },
    { id: "contact", label: "Contact", enabled: true, order: 6 },
  ],
  seo: {
    pageTitle: "Alex Rivera — Full-Stack Engineer & Product Designer",
    metaDescription:
      "Portfolio of Alex Rivera, full-stack engineer specializing in accessible, high-performance web apps. View projects, experience, and get in touch.",
    keywords:
      "full-stack engineer, portfolio, React, Next.js, accessibility, WCAG, TypeScript, product designer",
    ogImage: "",
    canonicalUrl: "https://example.com",
    author: "Alex Rivera",
  },
};
